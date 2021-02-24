package commands

import (
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/bken-io/tidal/src/utils"
	"github.com/minio/minio-go/v7"
)

// TranscodeInputEvent is for Transcode
type TranscodeInputEvent struct {
	VideoID     string
	PresetName  string
	Cmd         string
	InURI       string
	OutURI      string
	InS3Client  *minio.Client
	OutS3Client *minio.Client
}

func runTranscode(inPath string, flags string, outPath string) string {
	ffmpegCmdParts := strings.Split(flags, " ")
	args := []string{}
	args = append(args, "-hide_banner")
	args = append(args, "-y")
	args = append(args, "-i")
	args = append(args, inPath)

	for i := 0; i < len(ffmpegCmdParts); i++ {
		args = append(args, ffmpegCmdParts[i])
	}

	args = append(args, outPath)
	fmt.Println("ffmpeg command", args)
	cmd := exec.Command("ffmpeg", args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		fmt.Println("Error:", err)
		panic(err)
	}

	return outPath
}

// Transcode runs ffmpeg with given inputs and outputs
func Transcode(e TranscodeInputEvent) {
	// config := utils.GlobalConfig()
	fmt.Println("Setting up transcode vars")
	debug := os.Getenv("DEBUG")
	sourceSegmentDir := filepath.Dir(e.InURI)
	transcodedSegmentDir := filepath.Dir(e.OutURI)

	fmt.Println("Making directory", transcodedSegmentDir)
	os.MkdirAll(transcodedSegmentDir, os.ModePerm)
	fmt.Println("Transcoding segment")
	runTranscode(e.InURI, e.Cmd, e.OutURI)

	sourceSegments, _ := ioutil.ReadDir(sourceSegmentDir)
	transcodedSegments, _ := ioutil.ReadDir(transcodedSegmentDir)

	if len(sourceSegments) == len(transcodedSegments) {
		fmt.Println(len(sourceSegments), len(transcodedSegments))
		fmt.Println("Transcode finished!")

		if debug != "" {
			// Package(PackageEvent{
			// 	InDir:  "/nfs/tidal/aawawdaw/versions/360",
			// 	OutDir: "/nfs/tidal/awdawd/hls/360",
			// })
		} else {
			jobMeta := []string{
				fmt.Sprintf(`s3_in=s3://tidal/%s/versions/%s/segments`, e.VideoID, e.PresetName), // TODO :: Interpolate bucket
				fmt.Sprintf(`s3_out=s3://cdn.bken.io/v/%s`, e.VideoID),                           // TODO :: Interpolate bucket
			}
			utils.DispatchNomadJob("package", jobMeta)
		}
	}
}
