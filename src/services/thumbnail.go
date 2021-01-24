package services

import (
	"context"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"strings"
	"time"

	"github.com/bken-io/tidal/src/utils"
	"github.com/minio/minio-go/v7"
)

// SourceObject is an s3 construct
type SourceObject struct {
	Bucket string
	Key    string
}

func decontructS3Uri(s3URI string) SourceObject {
	s := strings.Split(s3URI, "/")
	Bucket := s[2]
	Key := strings.Join(s[3:], "/")
	sourceObject := SourceObject{Bucket: Bucket, Key: Key}
	return sourceObject
}

// GenerateThumbnail creates a video thumbnail
func GenerateThumbnail(e utils.ThumbnailInput) {
	s3Client := utils.CreateClient(e.S3Config)
	signedURL := getSignedURL(e, s3Client)

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

	deconstructed := decontructS3Uri(e.S3Out)
	uploadInfo, err := s3Client.PutObject(
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

func getSignedURL(e utils.ThumbnailInput, s3Client *minio.Client) string {
	deconstructed := decontructS3Uri(e.S3In)
	presignedURL, err := s3Client.PresignedGetObject(
		context.Background(),
		deconstructed.Bucket,
		deconstructed.Key,
		time.Second*24*60*60,
		nil)
	if err != nil {
		fmt.Println(err)
	}
	return presignedURL.String()
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
