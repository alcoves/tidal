package services

import (
	"fmt"
	"os"
	"os/exec"
	"strings"
)

// ThumbnailInput is for GenerateThumbnail
type ThumbnailInput struct {
	s3In  string
	cmd   string
	s3Out string
}

// GenerateThumbnail creates a video thumbnail
func GenerateThumbnail(e ThumbnailInput) {
	outputPath := "/tmp/create/out.webp"
	cmd := getThumbnailCommand(e, outputPath)

	if err := cmd.Run(); err != nil {
		fmt.Println("Error:", err)
		panic(err)
	}

	// Upload to CDN
}

func getThumbnailCommand(inputPath string, ffmpegCmd string, outputPath string) *exec.Cmd {
	ffmpegCmdParts := strings.Split(ffmpegCmd, " ")

	args := []string{}
	args = append(args, "-y")
	args = append(args, "-i")
	args = append(args, inputPath)

	for i := 0; i < len(ffmpegCmdParts); i++ {
		args = append(args, ffmpegCmdParts[i])
	}

	args = append(args, outputPath)
	cmd := exec.Command("ffmpeg", args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd
}
