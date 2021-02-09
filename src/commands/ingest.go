package commands

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"os/exec"

	"github.com/bken-io/tidal/src/utils"
	"github.com/minio/minio-go/v7"
)

// IngestVideoEvent is for ingesting a video into Tidal
type IngestVideoEvent struct {
	S3In        string
	VideoID     string
	S3InClient  *minio.Client
	S3OutClient *minio.Client
}

func segmentVideo(inPath string, tmpDir string) string {
	outputPath := fmt.Sprintf("%s/segments", tmpDir)
	outputPathPattern := outputPath + "/%09d.mp4"
	cDirErr := os.Mkdir(outputPath, 0755)
	if cDirErr != nil {
		panic(cDirErr)
	}

	args := []string{}
	args = append(args, "-y")
	args = append(args, "-i")
	args = append(args, inPath)
	args = append(args, "-an")
	args = append(args, "-c:v")
	args = append(args, "copy")
	args = append(args, "-f")
	args = append(args, "segment")
	args = append(args, "-segment_time")
	args = append(args, "10")

	args = append(args, outputPathPattern)
	cmd := exec.Command("ffmpeg", args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		fmt.Println("Error:", err)
		panic(err)
	}

	return outputPath
}

func splitSourceAudio(inPath string, tmpDir string) string {
	outputPath := fmt.Sprintf("%s/audio.aac", tmpDir)

	args := []string{}
	args = append(args, "-y")
	args = append(args, "-i")
	args = append(args, inPath)
	args = append(args, "-vn")

	args = append(args, outputPath)
	cmd := exec.Command("ffmpeg", args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		fmt.Println("Error:", err)
		panic(err)
	}

	return outputPath
}

type FFmpegStream struct {
	Index int `json:"index"`
}

type HasAudio struct {
	Streams []FFmpegStream `json:"streams"`
}

func checkForAudio(inPath string) bool {
	args := []string{}
	args = append(args, "-i")
	args = append(args, inPath)
	args = append(args, "-show_streams")
	args = append(args, "-select_streams")
	args = append(args, "a")
	args = append(args, "-of")
	args = append(args, "json")
	args = append(args, "-loglevel")
	args = append(args, "error")

	cmd := exec.Command("ffprobe", args...)
	out, err := cmd.Output()
	if err != nil {
		fmt.Println("Error:", err)
		panic(err)
	}

	hasAudio := new(HasAudio)
	json.Unmarshal(out, &hasAudio)

	if len(hasAudio.Streams) >= 1 {
		fmt.Println("File has audio")
		return true
	} else {
		fmt.Println("File does not have audio")
		return false
	}
}

// IngestVideo returns a json list of availible presets
func IngestVideo(e IngestVideoEvent) {
	fmt.Println("Creating temporary directory")
	tmpDir, err := ioutil.TempDir("/tmp", "tidal-ingest-")
	if err != nil {
		log.Fatal(err)
	}

	// TODO :: Implement
	fmt.Println("Cleaning up source")
	fmt.Println("Cleaning up destination")

	fmt.Println("Getting video presets")
	signedURL := utils.GetSignedURL(e.S3InClient, e.S3In)
	presets := CalculatePresets(signedURL)

	for i := 0; i < len(presets); i++ {
		p := presets[i]
		fmt.Println("Placing Marker ::", p.Name)
		// Markers show early progress to the UI
		file, err := ioutil.TempFile("/tmp", "tidal-preset-marker-")
		if err != nil {
			log.Fatal("failed to create marker file")
		}

		uploadInfo, err := e.S3OutClient.PutObject(
			context.Background(),
			"tidal", // TODO :: interpolate
			fmt.Sprintf("%s/versions/%s/", e.VideoID, p.Name),
			file,
			0,
			minio.PutObjectOptions{})

		fmt.Println("uploadInfo", uploadInfo)
		defer os.Remove(file.Name())
		if err != nil {
			log.Fatal("failed to upload marker to s3 remote")
		}
	}

	fmt.Println("Downloading video file")
	d := utils.DecontructS3Uri(e.S3In)
	videoPath := utils.GetObject(e.S3InClient, d.Bucket, d.Key, tmpDir)

	fmt.Println("Segmenting video")
	segmentsDir := segmentVideo(videoPath, tmpDir)

	fmt.Println("Uploading segments")
	// TODO :: tidal bucket should be a global env var
	utils.Sync(
		e.S3OutClient,
		segmentsDir,
		"tidal",
		fmt.Sprintf("%s/segments", e.VideoID))

	fmt.Println("Checking for audio")
	if checkForAudio(videoPath) {
		fmt.Println("Splitting source audio")
		sourceAudioPath := splitSourceAudio(videoPath, tmpDir)
		fmt.Println("Uploading source audio")
		utils.PutObject(
			e.S3OutClient,
			"tidal",                                // TODO :: Interpolate
			fmt.Sprintf("%s/audio.aac", e.VideoID), // TODO :: get filename from path
			sourceAudioPath)
	}

	fmt.Println("Dispatching transcoding jobs")
	files, _ := ioutil.ReadDir(segmentsDir)
	for i := 0; i < len(presets); i++ {
		preset := presets[i]
		for i := 0; i < len(files); i++ {
			segment := files[i]
			fmt.Println("segments", preset.Name, segment.Name())
			jobMeta := []string{
				fmt.Sprintf(`cmd=%s`, preset.Cmd),
				fmt.Sprintf(`s3_in=s3://tidal/%s/segments/%s`,
					e.VideoID,
					segment.Name()),
				fmt.Sprintf(
					`s3_out=s3://tidal/%s/versions/%s/segments/%s`,
					e.VideoID,
					preset.Name,
					segment.Name()),
			}
			utils.DispatchNomadJob("transcode", jobMeta)
		}
	}

	fmt.Println("Removing temporary directory", tmpDir)
	delErr := os.RemoveAll(tmpDir)
	if delErr != nil {
		log.Fatal(delErr)
	}
}
