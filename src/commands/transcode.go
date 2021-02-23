package commands

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

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

	fmt.Println("Determining tmp directory")
	directory := filepath.Dir(e.OutURI)
	fmt.Println("Making directory", directory)
	os.MkdirAll(directory, os.ModePerm)

	fmt.Println("Transcoding segment")
	runTranscode(e.InURI, e.Cmd, e.OutURI)

	// sourceSegPrefix := fmt.Sprintf("%s/segments/", e.VideoID)
	// transcodedSegPrefix := fmt.Sprintf("%s/versions/%s/segments/", e.VideoID, e.PresetName)
	// sourceObjects := utils.ListObjects(e.S3OutClient, "tidal", sourceSegPrefix)         // TODO :: Interpolate bucket
	// transcodedObjects := utils.ListObjects(e.S3OutClient, "tidal", transcodedSegPrefix) // TODO :: Interpolate bucket

	// fmt.Println("Source Segment Count: ", len(sourceObjects))
	// fmt.Println("Transcoded Segment Count: ", len(transcodedObjects))

	// if len(transcodedObjects) == len(sourceObjects) {
	// 	fmt.Println("Video is ready for packaging")
	// 	lockKey := fmt.Sprintf("tidal/%s/%s", e.VideoID, e.PresetName)
	// 	lock, err := utils.NewLock(lockKey)
	// 	if err != nil {
	// 		fmt.Println("Unable to create consul lock:", err.Error())
	// 		log.Fatal(err)
	// 	}
	// 	if err := lock.Lock(); err != nil {
	// 		fmt.Println("Error while trying to acquire lock:", err.Error())
	// 		log.Fatal(err)
	// 	}
	// 	defer lock.Unlock()
	// 	jobMeta := []string{
	// 		fmt.Sprintf(`s3_in=s3://tidal/%s/versions/%s/segments`, e.VideoID, e.PresetName), // TODO :: Interpolate bucket
	// 		fmt.Sprintf(`s3_out=s3://cdn.bken.io/v/%s`, e.VideoID),                           // TODO :: Interpolate bucket
	// 	}
	// 	utils.DispatchNomadJob("package", jobMeta)
	// } else if len(transcodedObjects) > len(sourceObjects) {
	// 	log.Fatal("The transcoded segments counted are grater than the source segments")
	// }
}
