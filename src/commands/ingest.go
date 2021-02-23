package commands

import (
	b64 "encoding/base64"
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
	InURI       string
	OutURI      string
	InS3Client  *minio.Client
	OutS3Client *minio.Client
}

func segmentVideo(inPath string, tidalDir string) string {
	outputPath := fmt.Sprintf("%s/segments", tidalDir)
	outputPathPattern := outputPath + "/%09d.mp4" // TODO :: this should be whatever extension the source video has
	cDirErr := os.Mkdir(outputPath, os.ModePerm)
	if cDirErr != nil {
		panic(cDirErr)
	}

	args := []string{}
	args = append(args, "-hide_banner")
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

func splitSourceAudio(inPath string, tidalDir string) string {
	outputPath := fmt.Sprintf("%s/audio.aac", tidalDir)

	args := []string{}
	args = append(args, "-hide_banner")
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
	args = append(args, "-hide_banner")
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
	fmt.Println("Beginning ingest")
	debug := os.Getenv("DEBUG")
	s3Inb64 := b64.StdEncoding.EncodeToString([]byte(e.InURI))

	// Directory is the b64 of the input URI
	tidalDir := fmt.Sprintf("/nfs/tidal/%s", s3Inb64)

	fmt.Println("Cleaning up NFS before starting")
	err := os.RemoveAll(tidalDir)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Creating working dir on NFS share")
	err = os.MkdirAll(tidalDir, os.ModePerm)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Getting video presets")
	presets := CalculatePresets(e.InURI)

	// TODO :: Update tidal db here, gives fast feedback to UI

	fmt.Println("Segmenting video")
	segmentsDir := segmentVideo(e.InURI, tidalDir)

	fmt.Println("Checking for audio")
	if checkForAudio(e.InURI) {
		fmt.Println("Splitting source audio")
		splitSourceAudio(e.InURI, tidalDir)
	}

	fmt.Println("Dispatching transcoding jobs")
	files, _ := ioutil.ReadDir(segmentsDir)

	// Update tidal.config file

	for i := 0; i < len(presets); i++ {
		preset := presets[i]
		for i := 0; i < len(files); i++ {
			segment := files[i]
			fmt.Println("segments", preset.Name, segment.Name())
			inPath := fmt.Sprintf(`%s/segments/%s`,
				tidalDir,
				segment.Name())
			outPath := fmt.Sprintf(
				`%s/versions/%s/segments/%s`,
				tidalDir,
				preset.Name,
				segment.Name())

			jobMeta := []string{
				fmt.Sprintf(`cmd=%s`, preset.Cmd),
				fmt.Sprintf("in_path=%s", inPath),
				fmt.Sprintf("out_path=%s", outPath),
			}

			if debug != "" {
				Transcode(TranscodeInputEvent{
					InURI:  inPath,
					OutURI: outPath,
					Cmd:    preset.Cmd,
				})
			} else {
				utils.DispatchNomadJob("transcode", jobMeta)
			}
		}
	}
}
