package commands

// import (
// 	"fmt"
// 	"io/ioutil"
// 	"log"
// 	"os"
// 	"os/exec"
// 	"strings"

// 	"github.com/bken-io/tidal/src/utils"
// )

// // ThumbnailInput is for GenerateThumbnail
// type ThumbnailInput struct {
// 	Cmd          string
// 	RcloneSource string
// 	RcloneDest   string
// }

// func generateThumbnail(thumbnailPath string, cmd string) {
// 	ffmpegCmdParts := strings.Split(cmd, " ")
// 	args := []string{}
// 	args = append(args, "-y")
// 	args = append(args, "-i")
// 	args = append(args, thumbnailPath)

// 	for i := 0; i < len(ffmpegCmdParts); i++ {
// 		args = append(args, ffmpegCmdParts[i])
// 	}

// 	args = append(args, outputPath)
// 	cmd := exec.Command("ffmpeg", args...)
// 	cmd.Stdout = os.Stdout
// 	cmd.Stderr = os.Stderr
// 	return cmd
// }

// func Thumbnail(e ThumbnailInput) {
// 	fmt.Println("Starting thumbnail job")
// 	thumbnailPath, err := ioutil.TempFile("/tmp", "tidal-thumbnail-*.webp")
// 	if err != nil {
// 		log.Fatal(err)
// 	}

// 	thumbnailPath, err := ioutil.TempFile("/tmp", "tidal-thumbnail-*.webp")
// 	if err != nil {
// 		log.Fatal(err)
// 	}

// 	fmt.Println("Generating thumbnail")
// 	// TODO :: Can this be replaced with a generic ffmpeg func?
// 	generateThumbnail(thumbnailPath, e.Cmd)

// 	fmt.Println("Uploading thumbnail")
// 	utils.Rclone("copy", []string{thumbnailPath, e.RcloneDest})

// }
