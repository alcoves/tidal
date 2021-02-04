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
	tmpDir, err := ioutil.TempDir("/tmp", "tidal-transcode-")
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Download source segment")
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

	fmt.Println("Gathering segment counts")
	sourceSegPrefix := fmt.Sprintf("%s/segments/", e.VideoID)
	transcodedSegPrefix := fmt.Sprintf("%s/versions/%s/", e.VideoID, e.PresetName)
	sourceObjects := utils.ListObjects(e.S3OutClient, "tidal", sourceSegPrefix)         // TODO :: Interpolate bucket
	transcodedObjects := utils.ListObjects(e.S3OutClient, "tidal", transcodedSegPrefix) // TODO :: Interpolate bucket

	if len(sourceObjects) == len(transcodedObjects) {
		fmt.Println("Video is ready for packaging")
		lockKey := fmt.Sprintf("tidal/%s/%s", e.VideoID, e.PresetName)
		lock, err := utils.NewLock(lockKey)
		if err != nil {
			fmt.Println("Unable to create consul lock:", err.Error())
			log.Fatal(err)
		}
		if err := lock.Lock(); err != nil {
			fmt.Println("Error while trying to acquire lock:", err.Error())
			log.Fatal(err)
		}
		defer lock.Unlock()
		jobMeta := []string{
			fmt.Sprintf(`s3_in=s3://tidal/%s/versions/%s/segments`, e.VideoID, e.PresetName), // TODO :: Interpolate bucket
			fmt.Sprintf(`s3_out=s3://cdn.bken.io/v/%s`, e.VideoID),                           // TODO :: Interpolate bucket
		}
		utils.DispatchNomadJob("package", jobMeta)
	}

	fmt.Println("Removing temporary directory")
	err = os.RemoveAll(tmpDir)
	if err != nil {
		log.Fatal(err)
	}
}
