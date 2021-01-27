package commands

import (
	"context"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"strings"

	"github.com/bken-io/tidal/src/utils"
	"github.com/minio/minio-go/v7"
)

// GenerateThumbnail creates a video thumbnail
func GenerateThumbnail(e utils.ThumbnailInput) {
	signedURL := utils.GetSignedURL(e.S3InClient, e.S3In)

	tmpFile, err := ioutil.TempFile("/tmp", "tidal-thumbnail-*.webp")
	if err != nil {
		log.Fatal(err)
	}

	cmd := getThumbnailCommand(e, signedURL, tmpFile.Name())
	if err := cmd.Run(); err != nil {
		fmt.Println("Error:", err)
		panic(err)
	}

	file, err := os.Open(tmpFile.Name())
	if err != nil {
		fmt.Println(err)
		return
	}
	defer file.Close()

	fileStat, err := file.Stat()
	if err != nil {
		fmt.Println(err)
		return
	}

	deconstructed := utils.DecontructS3Uri(e.S3Out)
	uploadInfo, err := e.S3OutClient.PutObject(
		context.Background(),
		deconstructed.Bucket,
		deconstructed.Key,
		file,
		fileStat.Size(),
		minio.PutObjectOptions{ContentType: "image/webp"})
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println("Successfully uploaded bytes: ", uploadInfo)

	fmt.Println("Removing tmp files")
	defer os.Remove(file.Name())
}

func getThumbnailCommand(e utils.ThumbnailInput, signedURL string, outputPath string) *exec.Cmd {
	ffmpegCmdParts := strings.Split(e.Cmd, " ")

	args := []string{}
	args = append(args, "-y")
	args = append(args, "-i")
	args = append(args, signedURL)

	for i := 0; i < len(ffmpegCmdParts); i++ {
		args = append(args, ffmpegCmdParts[i])
	}

	args = append(args, outputPath)
	cmd := exec.Command("ffmpeg", args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd
}
