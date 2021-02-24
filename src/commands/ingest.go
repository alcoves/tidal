package commands

import (
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/bken-io/tidal/src/utils"
)

// Preset is a struct containing transcoder commands
type Preset struct {
	Name string `json:"name"`
	Cmd  string `json:"cmd"`
}

// Presets is an array of presets
type Presets []Preset

func transcode(sourcePath string, presets utils.Presets) string {
	sourceDir := filepath.Dir(sourcePath)
	progressiveDir := fmt.Sprintf("%s/progressive", sourceDir)
	os.Mkdir(progressiveDir, os.ModePerm)

	args := []string{}
	args = append(args, "-hide_banner")
	args = append(args, "-y")
	args = append(args, "-i")
	args = append(args, sourcePath)

	for i := 0; i < len(presets); i++ {
		preset := presets[i]
		outPath := fmt.Sprintf("%s/%s.mp4", progressiveDir, preset.Name)
		ffmpegCmdParts := strings.Split(preset.Cmd, " ")
		for j := 0; j < len(ffmpegCmdParts); j++ {
			args = append(args, ffmpegCmdParts[j])
			if j+1 == len(ffmpegCmdParts) {
				args = append(args, outPath)
			}
		}
	}

	fmt.Println("ffmpeg command", args)
	cmd := exec.Command("ffmpeg", args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		fmt.Println("Error:", err)
		panic(err)
	}

	return progressiveDir
}

func packageHls(tmpDir string, progressiveDir string) string {
	hlsDir := fmt.Sprintf("%s/hls", tmpDir)
	os.Mkdir(hlsDir, os.ModePerm)

	args := []string{}
	args = append(args, "--segment-duration")
	args = append(args, "6")
	args = append(args, "-f")
	args = append(args, "-o")
	args = append(args, hlsDir)

	files, _ := ioutil.ReadDir(progressiveDir)

	for i := 0; i < len(files); i++ {
		file := files[i]
		args = append(args, progressiveDir+"/"+file.Name())
	}

	fmt.Println("bento4", args)
	cmd := exec.Command("mp4hls", args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		fmt.Println("Error:", err)
		panic(err)
	}

	return hlsDir
}

// PipelineEvent is used to enqueue an end-to-end encoding job
type PipelineEvent struct {
	RcloneSource string // remote:path
	RcloneDest   string // remote:path
}

// Pipeline executes an end-to-end transcoding job
func Pipeline(e PipelineEvent) {
	tmpDir := "/home/brendan/code/bkenio/tidal/tmp"

	fmt.Println("Creating signed url")
	utils.Rclone("copy", []string{e.RcloneSource, tmpDir})

	fmt.Println("Getting video presets")
	presets := utils.CalculatePresets(tmpDir + "/test2.mp4")
	fmt.Println("presets", presets)

	fmt.Println("Transcoding video")
	progressiveDir := transcode(tmpDir+"/test2.mp4", presets)

	fmt.Println("Packaging video")
	packagedDir := packageHls(tmpDir, progressiveDir)

	fmt.Println("Syncing local files to remote")
	utils.Rclone("copy", []string{packagedDir, e.RcloneDest})
}
