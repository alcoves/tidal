package commands

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"time"

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

func splitAudio(sourcePath string) string {
	sourceDir := filepath.Dir(sourcePath)
	sourceAudioPath := fmt.Sprintf("%s/audio.wav", sourceDir)

	args := []string{}
	args = append(args, "-hide_banner")
	args = append(args, "-y")
	args = append(args, "-i")
	args = append(args, sourcePath)
	args = append(args, "-vn")
	args = append(args, sourceAudioPath)

	fmt.Println("ffmpeg command", args)
	cmd := exec.Command("ffmpeg", args...)
	// writeCmdLogs(cmd, "segmentation", tmpDir)

	if err := cmd.Run(); err != nil {
		fmt.Println("Error:", err)
		panic(err)
	}

	return sourceAudioPath
}

func transcodeSegment(wg *sync.WaitGroup, sourceSegmentPath string, transcodedSegmentPath string, ffmpegCmd string) string {
	defer wg.Done()
	ffmpegCmdParts := strings.Split(ffmpegCmd, " ")
	destDir := filepath.Dir(transcodedSegmentPath)
	os.MkdirAll(destDir, os.ModePerm)

	args := []string{}
	args = append(args, "-hide_banner")
	args = append(args, "-y")
	args = append(args, "-i")
	args = append(args, sourceSegmentPath)

	for i := 0; i < len(ffmpegCmdParts); i++ {
		args = append(args, ffmpegCmdParts[i])
	}

	args = append(args, transcodedSegmentPath)
	fmt.Println("ffmpeg command", args)
	cmd := exec.Command("ffmpeg", args...)
	// writeCmdLogs(cmd, "segmentation", tmpDir)

	if err := cmd.Run(); err != nil {
		fmt.Println("Error:", err)
		panic(err)
	}

	return transcodedSegmentPath
}

func concatinateSegments(progressiveDir string, manifestPath, presetName string) string {
	concatinatedVideoPath := fmt.Sprintf("%s/concatinated-%s.ts", progressiveDir, presetName)

	args := []string{}
	args = append(args, "-hide_banner")
	args = append(args, "-y")
	args = append(args, "-f")
	args = append(args, "concat")
	args = append(args, "-safe")
	args = append(args, "0")
	args = append(args, "-i")
	args = append(args, manifestPath)
	args = append(args, "-c:v")
	args = append(args, "copy")
	args = append(args, concatinatedVideoPath)

	cmd := exec.Command("ffmpeg", args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		fmt.Println("Error:", err)
		log.Fatal(err)
	}

	err := os.Remove(manifestPath)
	if err != nil {
		log.Fatal(err)
	}
	return concatinatedVideoPath
}

func createManifest(transcodedSegmentsDir string, progressiveDir string, presetName string) string {
	manifestPath := fmt.Sprintf("%s/manifest-%s.txt", progressiveDir, presetName)
	transcodedSegments, err := ioutil.ReadDir(transcodedSegmentsDir)
	if err != nil {
		log.Fatal(err)
	}

	for i := 0; i < len(transcodedSegments); i++ {
		seg := transcodedSegments[i]
		concatAppend := fmt.Sprintf("file '%s/%s'\n", transcodedSegmentsDir, seg.Name())
		// If the file doesn't exist, create it, or append to the file
		f, err := os.OpenFile(manifestPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
		if err != nil {
			log.Fatal(err)
		}
		if _, err := f.Write([]byte(concatAppend)); err != nil {
			log.Fatal(err)
		}
		if err := f.Close(); err != nil {
			log.Fatal(err)
		}
	}

	return manifestPath
}

func remuxWithAudio(concatinatedVideoPath string, sourceAudioPath string, presetName string) string {
	concatinatedDir := filepath.Dir(concatinatedVideoPath)
	remuxedVideoPath := fmt.Sprintf("%s/%s.mp4", concatinatedDir, presetName)

	args := []string{}
	args = append(args, "-hide_banner")
	args = append(args, "-y")
	args = append(args, "-i")
	args = append(args, concatinatedVideoPath)
	args = append(args, "-i")
	args = append(args, sourceAudioPath)
	args = append(args, "-c:v")
	args = append(args, "copy")
	args = append(args, remuxedVideoPath)

	cmd := exec.Command("ffmpeg", args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		fmt.Println("Error:", err)
		log.Fatal(err)
	}

	err := os.Remove(concatinatedVideoPath)
	if err != nil {
		log.Fatal(err)
	}
	return remuxedVideoPath
}

func segmentVideo(sourcePath string, presets utils.Presets) string {
	sourceDir := filepath.Dir(sourcePath)
	sourceSegmentsDir := fmt.Sprintf("%s/source-segments", sourceDir)
	os.Mkdir(sourceSegmentsDir, os.ModePerm)

	args := []string{}
	args = append(args, "-hide_banner")
	args = append(args, "-y")
	args = append(args, "-i")
	args = append(args, sourcePath)
	args = append(args, "-f")
	args = append(args, "segment")
	args = append(args, "-c")
	args = append(args, "copy")
	args = append(args, "-an")
	args = append(args, "-segment_time")
	args = append(args, "10")
	args = append(args, sourceSegmentsDir+`/%08d.ts`)

	fmt.Println("ffmpeg command", args)
	cmd := exec.Command("ffmpeg", args...)
	// writeCmdLogs(cmd, "segmentation", tmpDir)

	if err := cmd.Run(); err != nil {
		fmt.Println("Error:", err)
		panic(err)
	}

	return sourceSegmentsDir
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

func concatinate(transcodedSegmentsDir string, progressiveDir string, sourceAudioPath string, presetName string) {
	manifestPath := createManifest(transcodedSegmentsDir, progressiveDir, presetName)
	concatinatedVideoPath := concatinateSegments(progressiveDir, manifestPath, presetName)
	remuxWithAudio(concatinatedVideoPath, sourceAudioPath, presetName)
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

	fmt.Println("Setting up")
	progressiveDir := fmt.Sprintf("%s/progressive", tmpDir)
	os.MkdirAll(progressiveDir, os.ModePerm)
	transcodedSegmentsDir := fmt.Sprintf("%s/transcoded-segments", tmpDir)
	os.MkdirAll(transcodedSegmentsDir, os.ModePerm)

	filename := filepath.Base(e.RcloneSource)
	sourcePath := fmt.Sprintf("%s/%s", tmpDir, filename)

	fmt.Println("Downloading source file")
	utils.Rclone("copy", []string{e.RcloneSource, tmpDir}, e.Config.RcloneConfig)

	fmt.Println("Getting video presets")
	presets := utils.CalculatePresets(sourcePath)
	fmt.Println("presets", presets)

	fmt.Println("Splitting source audio")
	sourceAudioPath := splitAudio(sourcePath)
	fmt.Println("sourceAudioPath", sourceAudioPath)

	fmt.Println("Segmenting video")
	sourceSegmentsDir := segmentVideo(sourcePath, presets)
	fmt.Println("sourceSegmentsDir", sourceSegmentsDir)

	sourceSegments, _ := ioutil.ReadDir(sourceSegmentsDir)
	fmt.Println("Source segments count", len(sourceSegments))

	fmt.Println("Transcoding segments")

	for i := 0; i < len(sourceSegments); i++ {
		fmt.Println("Transcoding segment", sourceSegments[i].Name())
		var wg sync.WaitGroup
		for j := 0; j < len(presets); j++ {
			fmt.Println("Transcoding preset", presets[j].Name)
			sourceSegmentPath := fmt.Sprintf("%s/%s", sourceSegmentsDir, sourceSegments[i].Name())
			transcodedSegmentPath := fmt.Sprintf("%s/%s/%s", transcodedSegmentsDir, presets[j].Name, sourceSegments[i].Name())
			wg.Add(1)
			go transcodeSegment(&wg, sourceSegmentPath, transcodedSegmentPath, presets[j].Cmd)
		}
		wg.Wait()
	}

	fmt.Println("Waiting for transcoded to complete")
	timeoutLimit := 4320 * 60 // 72hrs in minutes
	for i := 0; i <= timeoutLimit; i++ {
		if i > 4320 {
			log.Fatal("Timeout waiting for transcoded segments has been reached")
		}
		transcodedSegments, _ := ioutil.ReadDir(transcodedSegmentsDir)
		expectedSegments := len(sourceSegments) * len(presets)
		fmt.Println("Transcoded segments count", len(transcodedSegments))
		fmt.Println("Expected segments count", expectedSegments)
		if expectedSegments == len(transcodedSegments) {
			fmt.Println("Transcoding complete!")
			break
		}
		time.Sleep(10 * time.Second)
	}

	for i := 0; i < len(presets); i++ {
		fmt.Println("Concatinating video", presets[i])
		transcodedSegmentsDir := fmt.Sprintf("%s/%s", transcodedSegmentsDir, presets[i].Name)
		concatinate(transcodedSegmentsDir, progressiveDir, sourceAudioPath, presets[i].Name)
	}

	fmt.Println("Packaging video")
	packagedDir := packageHls(tmpDir, progressiveDir)

	fmt.Println("Syncing hls assets with remote")
	utils.Rclone("copy", []string{packagedDir, e.RcloneDest}, e.Config.RcloneConfig)

	fmt.Println("Syncing logs with remote")
	utils.Rclone("copy", []string{tmpDir + "/logs", e.RcloneDest + "/logs"}, e.Config.RcloneConfig)

	fmt.Println("Remove temporary directory")
	err = os.RemoveAll(tmpDir)
	err = os.Remove(tmpDir)
	if err != nil {
		log.Fatal(err)
	}
}
