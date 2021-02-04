package commands

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"strings"

	"github.com/bken-io/tidal/src/utils"
	"github.com/minio/minio-go/v7"
)

// PackageInputEvent is gathered from the cli
type PackageInputEvent struct {
	S3In  string
	S3Out string
}

// PackageEvent adds additional metadata
type PackageEvent struct {
	VideoID     string
	PresetName  string
	S3In        string
	S3Out       string
	S3InClient  *minio.Client
	S3OutClient *minio.Client
}

// GenPackageEvent takes cli input and adds additional metadata
func GenPackageEvent(e PackageInputEvent) PackageEvent {
	s3InSplit := strings.Split(e.S3In, "/")
	// s3://tidal/123/versions/1080p/segments
	videoID := s3InSplit[3]
	presetName := s3InSplit[5]

	event := PackageEvent{
		VideoID:    videoID,
		PresetName: presetName,
		S3In:       e.S3In,
		S3Out:      e.S3Out,
		S3InClient: utils.CreateClient(utils.S3Config{
			Endpoint:        os.Getenv("S3_IN_ENDPOINT"),
			AccessKeyID:     os.Getenv("S3_IN_ACCESS_KEY_ID"),
			SecretAccessKey: os.Getenv("S3_IN_SECRET_ACCESS_KEY"),
		}),
		S3OutClient: utils.CreateClient(utils.S3Config{
			Endpoint:        os.Getenv("S3_OUT_ENDPOINT"),
			AccessKeyID:     os.Getenv("S3_OUT_ACCESS_KEY_ID"),
			SecretAccessKey: os.Getenv("S3_OUT_SECRET_ACCESS_KEY"),
		}),
	}

	return event
}

// CreateConcatinationManifest creates an ffmpeg concatination file
func CreateConcatinationManifest(tmpDir string) string {
	manifestPath := fmt.Sprintf("%s/manifest.txt", tmpDir)
	entries, err := ioutil.ReadDir(tmpDir + "/segments")
	if err != nil {
		log.Fatal(err)
	}

	for i := 0; i < len(entries); i++ {
		seg := entries[i]
		concatAppend := fmt.Sprintf("file './segments/%s'\n", seg.Name())

		// If the file doesn't exist, create it, or append to the file
		f, err := os.OpenFile(manifestPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
		if err != nil {
			log.Fatal(err)
		}
		if _, err := f.Write([]byte(concatAppend)); err != nil {
			log.Fatal(err)
		}
		if err := f.Close(); err != nil {
			log.Fatal(err)
		}
	}

	return manifestPath
}

func ConcatinateSegments(manifestPath string, tmpDir string) string {
	videoPath := fmt.Sprintf("%s/concatinated.mkv", tmpDir)

	args := []string{}
	args = append(args, "-hide_banner")
	args = append(args, "-f")
	args = append(args, "concat")
	args = append(args, "-safe")
	args = append(args, "0")
	args = append(args, "-y")
	args = append(args, "-i")
	args = append(args, manifestPath)
	args = append(args, "-c:v")
	args = append(args, "copy")
	args = append(args, videoPath)

	cmd := exec.Command("ffmpeg", args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		fmt.Println("Error:", err)
		log.Fatal(err)
	}

	return videoPath
}

func Remux(presetName string, videoPath string, audioPath string, tmpDir string) string {
	muxPath := fmt.Sprintf("%s/%s.mp4", tmpDir, presetName)

	args := []string{}
	args = append(args, "-hide_banner")
	args = append(args, "-y")
	args = append(args, "-i")
	args = append(args, videoPath)

	// If audio exists, mux it in here
	if audioPath != "" {
		args = append(args, "-i")
		args = append(args, audioPath)
	}

	args = append(args, "-c")
	args = append(args, "copy")
	args = append(args, "-movflags")
	args = append(args, "faststart")
	args = append(args, muxPath)

	cmd := exec.Command("ffmpeg", args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		fmt.Println("Error:", err)
		log.Fatal(err)
	}

	return muxPath
}

func CreateHLSAssets(muxPath string, tmpDir string, presetName string) string {
	hlsDir := fmt.Sprintf("%s/hls", tmpDir)
	playlistPath := fmt.Sprintf("%s/stream.m3u8", hlsDir)
	os.MkdirAll(hlsDir, os.ModePerm)

	args := []string{}
	args = append(args, "-hide_banner")
	args = append(args, "-y")
	args = append(args, "-i")
	args = append(args, muxPath)
	args = append(args, "-c")
	args = append(args, "copy")
	args = append(args, "-hls_time")
	args = append(args, "6")
	args = append(args, "-hls_playlist_type")
	args = append(args, "vod")
	args = append(args, "-hls_segment_type")
	args = append(args, "fmp4")
	args = append(args, "-hls_segment_filename")
	args = append(args, hlsDir+`/%09d.m4s`)
	args = append(args, playlistPath)

	cmd := exec.Command("ffmpeg", args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		fmt.Println("Error:", err)
		log.Fatal(err)
	}

	// Add comments to the stream.m3u8 playlist file
	// This is required for the creation of a master playlist

	// RESOLUTION=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 $MUXED_VIDEO_PATH)
	// BITRATE=$(ffprobe -v error -select_streams v:0 -show_entries stream=bit_rate -of default=noprint_wrappers=1:nokey=1 $MUXED_VIDEO_PATH)
	resolution := "1280x720"
	bitrate := 21345.0

	addition := "# Created By: https://github.com/bkenio/tidal\n"
	addition = addition + fmt.Sprintf(
		"# STREAM-INF:BANDWIDTH=%f,RESOLUTION=%s,NAME=%s",
		bitrate, resolution, presetName)

	// If the file doesn't exist, create it, or append to the file
	f, err := os.OpenFile(playlistPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatal(err)
	}
	if _, err := f.Write([]byte(addition)); err != nil {
		log.Fatal(err)
	}
	if err := f.Close(); err != nil {
		log.Fatal(err)
	}

	return hlsDir
}

// Package downloads all video segments for a given preset.
// Those presets are concatinated and stiched to source audio.
// HLS assets are generated and sent to the destination.
func Package(e PackageEvent) {
	fmt.Println("Setting up")
	fmt.Printf("%+v\n", e)

	fmt.Println("Create temporary directory")
	tmpDir, err := ioutil.TempDir("/tmp", "tidal-package-")
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Download transcoded segments")
	d := utils.DecontructS3Uri(e.S3In)
	transcodedSegmentsDir := fmt.Sprintf("%s/segments", tmpDir)
	os.MkdirAll(transcodedSegmentsDir, os.ModePerm)
	utils.SyncDown(e.S3InClient, transcodedSegmentsDir, d.Bucket, d.Key)

	fmt.Println("Create concatination manifest")
	manifestPath := CreateConcatinationManifest(tmpDir)

	fmt.Println("Concatinate segments")
	concatinatedVideoPath := ConcatinateSegments(manifestPath, tmpDir)

	fmt.Println("Remove segments directory")
	err = os.RemoveAll(transcodedSegmentsDir)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Check for audio")
	remoteAudioPath := fmt.Sprintf("%s/audio.aac", e.VideoID)
	audioObjects := utils.ListObjects(e.S3InClient, d.Bucket, remoteAudioPath)
	audioPath := ""

	if len(audioObjects) == 1 {
		fmt.Println("Download audio")
		audioPath = utils.GetObject(e.S3InClient, d.Bucket, remoteAudioPath, tmpDir)
	}

	fmt.Println("Remux final video")
	muxPath := Remux(e.PresetName, concatinatedVideoPath, audioPath, tmpDir)
	fmt.Println("muxPath", muxPath)

	fmt.Println("Remove concatinated video", concatinatedVideoPath)
	err = os.Remove(concatinatedVideoPath)
	if err != nil {
		log.Fatal(err)
	}

	// TODO :: progressive videos are not getting uploaded
	// It may be useful to store these non-hls variants

	fmt.Println("Create HLS assets")
	hlsDir := CreateHLSAssets(muxPath, tmpDir, e.PresetName)

	fmt.Println("Upload HLS assets to the destination")
	s3OutDeconstructed := utils.DecontructS3Uri(e.S3Out)
	utils.Sync(e.S3OutClient, hlsDir, s3OutDeconstructed.Bucket, s3OutDeconstructed.Key)

	fmt.Println("Creater master.m3u8")
	GenerateHLSMasterPlaylist(GenerateHLSMasterPlaylistEvent{
		VideoID:    e.VideoID,
		PresetName: e.PresetName,
		S3Client:   e.S3OutClient,
		S3Key:      s3OutDeconstructed.Key,
		S3Bucket:   s3OutDeconstructed.Bucket,
		RemotePath: fmt.Sprintf("v/%s/hls/master.m3u8", e.VideoID), // TODO :: this makes too many assumptions
	})

	fmt.Println("Remove temporary directory")
	err = os.RemoveAll(tmpDir)
	if err != nil {
		log.Fatal(err)
	}
}
