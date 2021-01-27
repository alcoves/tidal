package commands

import (
	"fmt"
	"io/ioutil"
	"log"
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
	S3In        string
	S3Out       string
	S3InClient  *minio.Client
	S3OutClient *minio.Client
}

func runTranscode(inPath string, flags string, tmpDir string) string {
	ffmpegCmdParts := strings.Split(flags, " ")
	filename := filepath.Base(inPath)
	outputPath := fmt.Sprintf("%s/%s", tmpDir, "transcoded-"+filename)

	args := []string{}
	args = append(args, "-y")
	args = append(args, "-i")
	args = append(args, inPath)

	for i := 0; i < len(ffmpegCmdParts); i++ {
		args = append(args, ffmpegCmdParts[i])
	}

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

// Transcode runs ffmpeg with given inputs and outputs
func Transcode(e TranscodeInputEvent) {
	fmt.Println("Setting up transcode function variables")
	S3InDeconstructed := utils.DecontructS3Uri(e.S3In)
	S3OutDeconstructed := utils.DecontructS3Uri(e.S3Out)

	e.VideoID = strings.Split(S3InDeconstructed.Key, "/")[0]
	e.PresetName = strings.Split(S3OutDeconstructed.Key, "/")[2]

	fmt.Println("Creating temporary directory")
	tmpDir, err := ioutil.TempDir("/tmp", "")
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Download source segments")
	sourceSegmentPath := utils.GetObject(
		e.S3InClient,
		S3InDeconstructed.Bucket,
		S3InDeconstructed.Key,
		tmpDir)

	fmt.Println("Transcoding segment")
	transcodedSegmentPath := runTranscode(sourceSegmentPath, e.Cmd, tmpDir)

	fmt.Println("Uploading transcode to s3")
	utils.PutObject(
		e.S3OutClient,
		S3OutDeconstructed.Bucket,
		S3OutDeconstructed.Key,
		transcodedSegmentPath)

	fmt.Println("Counting transcoded segments")
	fmt.Println("If ready for concat, lockConcat.sh")

	fmt.Println("Removing temporary directory")
	err = os.RemoveAll(tmpDir)
	if err != nil {
		log.Fatal(err)
	}
}
