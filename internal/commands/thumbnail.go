package commands

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"os/exec"

	"github.com/bkenio/tidal/internal/utils"
)

// CreateThumbnailEvent is used to generate a video thumbnail event
type CreateThumbnailEvent struct {
	RcloneSource string `json:"rcloneSource"` // remote:path
	RcloneDest   string `json:"rcloneDest"`   // remote:path
}

func createThumbnail(sourceURL string, tmpDir string) string {
	thumbnailPath := fmt.Sprintf("%s/thumb.webp", tmpDir)

	args := []string{}
	args = append(args, "-hide_banner")
	args = append(args, "-y")
	args = append(args, "-i")
	args = append(args, sourceURL)
	args = append(args, "-vf")
	args = append(args, "scale=854:480:force_original_aspect_ratio=increase,crop=854:480")
	args = append(args, "-vframes")
	args = append(args, "1")
	args = append(args, "-q:v")
	args = append(args, "50")
	args = append(args, thumbnailPath)

	fmt.Println("ffmpeg command", args)
	cmd := exec.Command("ffmpeg", args...)
	// cmd.Stdout = os.Stdout
	// cmd.Stderr = os.Stderr
	// writeCmdLogs(cmd, "segmentation", tmpDir)

	if err := cmd.Run(); err != nil {
		fmt.Println("Error:", err)
		panic(err)
	}

	return thumbnailPath
}

// CreateThumbnail will create a video thumbnail
func CreateThumbnail(e CreateThumbnailEvent) {
	fmt.Println("Create temporary directory")
	os.MkdirAll(utils.Config.TidalTmpDir, os.ModePerm)
	tmpDir, err := ioutil.TempDir(utils.Config.TidalTmpDir, "tidal-thumbnail-")
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Getting signed URL")
	sourceURL := utils.Rclone("link", []string{e.RcloneSource, "--expire", "1h"}, utils.Config.RcloneConfig)

	fmt.Println("Create video thumbnail")
	thumbnailPath := createThumbnail(sourceURL, tmpDir)

	fmt.Println("Uploading thumbnail to destination")
	utils.Rclone("copyto", []string{thumbnailPath, e.RcloneDest}, utils.Config.RcloneConfig)

	fmt.Println("Removing tmp dir")
	err = os.RemoveAll(tmpDir)
	if err != nil {
		log.Fatal(err)
	}
}
