package commands

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/bkenio/tidal/internal/utils"
)

// Preset is a struct containing transcoder commands
type Preset struct {
	Name string `json:"name"`
	Cmd  string `json:"cmd"`
}

// Presets is an array of presets
type Presets []Preset

// PipelineEvent is used to enqueue an end-to-end encoding job
type PipelineEvent struct {
	Config       utils.Config
	RcloneSource string // remote:path
	RcloneDest   string // remote:path
}

func writeCmdLogs(cmd *exec.Cmd, logPrefix string, tmpDir string) {
	logDir := fmt.Sprintf("%s/logs", tmpDir)
	os.MkdirAll(logDir, os.ModePerm)

	stdoutFile, err := os.Create(fmt.Sprintf("%s/%s-stdout.txt", logDir, logPrefix))
	if err != nil {
		panic(err)
	}
	defer stdoutFile.Close()

	stderrFile, err := os.Create(fmt.Sprintf("%s/%s-stderr.txt", logDir, logPrefix))
	if err != nil {
		panic(err)
	}
	defer stderrFile.Close()

	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
}

func transcode(sourcePath string, presets utils.Presets, tmpDir string) string {
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
	writeCmdLogs(cmd, "transcode", tmpDir)

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
	writeCmdLogs(cmd, "package", tmpDir)

	if err := cmd.Run(); err != nil {
		fmt.Println("Error:", err)
		panic(err)
	}

	return hlsDir
}

// Pipeline executes an end-to-end transcoding job
func Pipeline(e PipelineEvent) {
	fmt.Println("Create temporary directory")
	os.MkdirAll(e.Config.TidalTmpDir, os.ModePerm)
	tmpDir, err := ioutil.TempDir(e.Config.TidalTmpDir, "tidal-pipeline-")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Tmp Dir:", tmpDir)

	filename := filepath.Base(e.RcloneSource)
	sourcePath := fmt.Sprintf("%s/%s", tmpDir, filename)

	fmt.Println("Downloading source file")
	utils.Rclone("copy", []string{e.RcloneSource, tmpDir}, e.Config.RcloneConfig)

	fmt.Println("Getting video presets")
	presets := utils.CalculatePresets(sourcePath)
	fmt.Println("presets", presets)

	fmt.Println("Transcoding video")
	progressiveDir := transcode(sourcePath, presets, tmpDir)

	fmt.Println("Packaging video")
	packagedDir := packageHls(tmpDir, progressiveDir)

	fmt.Println("Syncing hls assets with remote")
	utils.Rclone("copy", []string{packagedDir, e.RcloneDest}, e.Config.RcloneConfig)

	fmt.Println("Syncing logs with remote")
	utils.Rclone("copy", []string{tmpDir + "/logs", e.RcloneDest + "/logs"}, e.Config.RcloneConfig)

	fmt.Println("Remove temporary directory")
	err = os.RemoveAll(tmpDir)
	if err != nil {
		log.Fatal(err)
	}
}
