package commands

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

// TranscodeEvent is used to validate the cli arguments for a video transcode
type TranscodeEvent struct {
	Cmd          string `json:"cmd"`
	RcloneSource string `json:"rcloneSource"` // remote:path
	RcloneDest   string `json:"rcloneDest"`   // remote:path
}

// Transcode performs an ffmpeg command on a given rclone source file
func Transcode(e TranscodeEvent) string {
	// TODO :: The names RcloneSource and RcloneDest indicate that the inputs to
	// the transcode function can be remote paths (so long as rlcone can fetch).
	// This is not the case, the source and dest paths must be local file paths.
	// Transcode should be refactored to fetch files if the source and dest path
	// look like they point to rclone remotes.

	filename := filepath.Base(e.RcloneDest)
	tmpFilePattern := fmt.Sprintf("tidal-transcode-segment.*.%s", filename)
	tmpFile, err := ioutil.TempFile("/tmp", tmpFilePattern)
	if err != nil {
		log.Fatal(err)
	}

	ffmpegCmdParts := strings.Split(e.Cmd, " ")
	destDir := filepath.Dir(e.RcloneDest)
	os.MkdirAll(destDir, os.ModePerm)

	args := []string{}
	args = append(args, "-hide_banner")
	args = append(args, "-y")
	args = append(args, "-i")
	args = append(args, e.RcloneSource)

	for i := 0; i < len(ffmpegCmdParts); i++ {
		args = append(args, ffmpegCmdParts[i])
	}

	args = append(args, tmpFile.Name())
	fmt.Println("ffmpeg command", args)
	cmd := exec.Command("ffmpeg", args...)
	// writeCmdLogs(cmd, "segmentation", tmpDir)

	if err := cmd.Run(); err != nil {
		fmt.Println("Error:", err)
		panic(err)
	}

	err = os.Rename(tmpFile.Name(), e.RcloneDest)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("success!")
	return e.RcloneDest
}
