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

	"github.com/bkenio/tidal/internal/nomad"
	"github.com/bkenio/tidal/internal/utils"
	"github.com/dariubs/percent"
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
	WebhookURL   string // where to send patch updates to
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

func splitAudio(wg *sync.WaitGroup, sourceLink string, sourceAudioPath string) {
	defer wg.Done()

	args := []string{}
	args = append(args, "-hide_banner")
	args = append(args, "-y")
	args = append(args, "-i")
	args = append(args, sourceLink)
	args = append(args, "-vn")
	args = append(args, sourceAudioPath)

	fmt.Println("ffmpeg command", args)
	cmd := exec.Command("ffmpeg", args...)
	// writeCmdLogs(cmd, "segmentation", tmpDir)

	if err := cmd.Run(); err != nil {
		fmt.Println("Error:", err)
		panic(err)
	}
}

func countFiles(path string) []string {
	fileList := []string{}
	err := filepath.Walk(path, func(path string, f os.FileInfo, err error) error {
		if f.IsDir() {
			return nil
		}
		// Ignore hidden files, this is really important for some callers (like progress estimation)
		if f.Name()[0] == '.' {
			return nil
		}
		fileList = append(fileList, path)
		return nil
	})
	if err != nil {
		log.Fatal(err)
	}
	return fileList
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
	// -map_metadata 0 -metadata:s:v rotate="90" needed to support rotated video

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

func segmentVideo(wg *sync.WaitGroup, sourceLink string, sourceSegmentsDir string, presets utils.Presets, duration float64) {
	defer wg.Done()
	os.Mkdir(sourceSegmentsDir, os.ModePerm)

	segmentTime := "120"
	if duration < 3600 {
		segmentTime = "60"
	} else if duration < 1800 {
		segmentTime = "30"
	} else if duration < 900 {
		segmentTime = "20"
	} else if duration < 300 {
		segmentTime = "10"
	}

	args := []string{}
	args = append(args, "-hide_banner")
	args = append(args, "-y")
	args = append(args, "-i")
	args = append(args, sourceLink)
	args = append(args, "-f")
	args = append(args, "segment")
	args = append(args, "-c")
	args = append(args, "copy")
	args = append(args, "-an")
	args = append(args, "-segment_time")
	args = append(args, segmentTime)
	args = append(args, sourceSegmentsDir+`/%08d.ts`) // TODO :: support more than x264 segments

	fmt.Println("ffmpeg command", args)
	cmd := exec.Command("ffmpeg", args...)
	// writeCmdLogs(cmd, "segmentation", tmpDir)

	if err := cmd.Run(); err != nil {
		fmt.Println("Error:", err)
		panic(err)
	}
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

func concatinate(wg *sync.WaitGroup, transcodedSegmentsDir string, progressiveDir string, sourceAudioPath string, presetName string) {
	defer wg.Done()
	manifestPath := createManifest(transcodedSegmentsDir, progressiveDir, presetName)
	concatinatedVideoPath := concatinateSegments(progressiveDir, manifestPath, presetName)
	remuxWithAudio(concatinatedVideoPath, sourceAudioPath, presetName)
}

// Pipeline executes an end-to-end transcoding job
func Pipeline(e PipelineEvent) {
	srcFilename := filepath.Base(e.RcloneSource)
	videoID := strings.TrimSuffix(srcFilename, filepath.Ext(srcFilename))

	// First update
	tidalMeta := utils.TidalMeta{
		ID:     videoID,
		Status: "started",
	}
	utils.UpsertTidalMeta(&tidalMeta, e.WebhookURL)

	fmt.Println("Create temporary directory")
	os.MkdirAll(utils.Config.TidalTmpDir, os.ModePerm)
	tmpDir, err := ioutil.TempDir(utils.Config.TidalTmpDir, videoID+"-")
	if err != nil {
		log.Fatal(err)
	}
	defer os.RemoveAll(tmpDir)
	os.Mkdir(tmpDir, os.ModePerm)
	fmt.Println("Tmp Dir:", tmpDir)

	fmt.Println("Setting up")
	progressiveDir := fmt.Sprintf("%s/progressive", tmpDir)
	os.MkdirAll(progressiveDir, os.ModePerm)
	transcodedSegmentsDir := fmt.Sprintf("%s/transcoded-segments", tmpDir)
	os.MkdirAll(transcodedSegmentsDir, os.ModePerm)

	fmt.Println("Generating signed url for fetching")
	sourceLink := utils.Rclone("link", []string{e.RcloneSource}, utils.Config.RcloneConfig)

	fmt.Println("Creating initial thumbnail")
	rcloneThumbnailDest := e.RcloneDest + "/thumb.webp"
	thumbnailEvent := CreateThumbnailEvent{
		RcloneSource: e.RcloneSource,
		RcloneDest:   rcloneThumbnailDest,
	}
	CreateThumbnail(thumbnailEvent)
	tidalMeta.Thumbnail = rcloneThumbnailDest
	utils.UpsertTidalMeta(&tidalMeta, e.WebhookURL)

	fmt.Println("Getting video presets")
	videoMetadata := utils.GetMetadata(sourceLink)
	presets := utils.CalculatePresets(videoMetadata)
	fmt.Println("presets", presets)
	tidalMeta.Duration = videoMetadata.Duration

	for i := 0; i < len(presets); i++ {
		rendition := utils.TidalMetaRendition{
			PercentCompleted: 0,
			Type:             "hls",
			Name:             presets[i].Name,
		}
		tidalMeta.Renditions = append(tidalMeta.Renditions, rendition)
	}
	utils.UpsertTidalMeta(&tidalMeta, e.WebhookURL)

	fmt.Println("Segmenting video")
	tidalMeta.Status = "segmenting"
	utils.UpsertTidalMeta(&tidalMeta, e.WebhookURL)

	var segmentWg sync.WaitGroup
	sourceAudioPath := fmt.Sprintf("%s/audio.wav", tmpDir)
	fmt.Println("sourceAudioPath", sourceAudioPath)
	go splitAudio(&segmentWg, sourceLink, sourceAudioPath)
	segmentWg.Add(1)

	sourceSegmentsDir := fmt.Sprintf("%s/source-segments", tmpDir)
	fmt.Println("sourceSegmentsDir", sourceSegmentsDir)
	go segmentVideo(&segmentWg, sourceLink, sourceSegmentsDir, presets, videoMetadata.Duration)
	segmentWg.Add(1)

	fmt.Println("Waiting for segmentation to complete")
	segmentWg.Wait()

	sourceSegments, _ := ioutil.ReadDir(sourceSegmentsDir)
	fmt.Println("Source segments count", len(sourceSegments))

	tidalMeta.SourceSegmentsCount = len(sourceSegments)
	utils.UpsertTidalMeta(&tidalMeta, e.WebhookURL)

	fmt.Println("Transcoding segments")
	tidalMeta.Status = "transcoding"
	utils.UpsertTidalMeta(&tidalMeta, e.WebhookURL)
	for i := 0; i < len(sourceSegments); i++ {
		fmt.Println("Transcoding segment", sourceSegments[i].Name())
		for j := 0; j < len(presets); j++ {
			fmt.Println("Transcoding preset", presets[j].Name)
			sourceSegmentPath := fmt.Sprintf("%s/%s", sourceSegmentsDir, sourceSegments[i].Name())
			transcodedSegmentPath := fmt.Sprintf("%s/%s/%s", transcodedSegmentsDir, presets[j].Name, sourceSegments[i].Name())
			transcodePayload := []string{
				fmt.Sprintf(`cmd=%s`, presets[j].Cmd),
				fmt.Sprintf(`rclone_source=%s`, sourceSegmentPath),
				fmt.Sprintf(`rclone_dest=%s`, transcodedSegmentPath),
			}
			nomad.Dispatch("transcode", transcodePayload, utils.Config.NomadToken)
		}
	}

	fmt.Println("Waiting for transcoded to complete")
	timeoutLimit := 4320 * 60 // 72hrs in minutes
	for i := 0; i <= timeoutLimit; i++ {
		if i > 4320 {
			tidalMeta.Status = "failed"
			utils.UpsertTidalMeta(&tidalMeta, e.WebhookURL)
			fmt.Println("Timeout waiting for transcoded segments has been reached")
			os.Exit(0)
		}
		transcodedSegments := countFiles(transcodedSegmentsDir)
		expectedSegments := len(sourceSegments) * len(presets)

		for i := 0; i < len(presets); i++ {
			for j, v := range tidalMeta.Renditions {
				if v.Name == presets[i].Name {
					transcodedRenditionSegments, _ := ioutil.ReadDir(transcodedSegmentsDir + "/" + presets[i].Name)
					percentCompleted := 0.0
					if len(transcodedRenditionSegments) > 0 {
						percentCompleted = percent.PercentOf(len(transcodedRenditionSegments), len(sourceSegments))
					}

					tidalMeta.Renditions[j].PercentCompleted = percentCompleted
					break
				}
			}
		}

		tidalMeta.PercentCompleted = percent.PercentOf(len(transcodedSegments), expectedSegments)
		utils.UpsertTidalMeta(&tidalMeta, e.WebhookURL)

		fmt.Println("Percent Completed", tidalMeta.PercentCompleted)
		if len(transcodedSegments) >= expectedSegments {
			fmt.Println("Transcoding complete!")
			break
		}
		time.Sleep(2 * time.Second)
	}

	tidalMeta.Status = "packaging"
	utils.UpsertTidalMeta(&tidalMeta, e.WebhookURL)

	var concatWg sync.WaitGroup
	for i := 0; i < len(presets); i++ {
		fmt.Println("Concatinating video", presets[i])
		transcodedSegmentsDir := fmt.Sprintf("%s/%s", transcodedSegmentsDir, presets[i].Name)
		concatWg.Add(1)
		go concatinate(&concatWg, transcodedSegmentsDir, progressiveDir, sourceAudioPath, presets[i].Name)
	}
	concatWg.Wait()

	fmt.Println("Packaging video")
	packagedDir := packageHls(tmpDir, progressiveDir)

	tidalMeta.Status = "finalizing"
	utils.UpsertTidalMeta(&tidalMeta, e.WebhookURL)

	fmt.Println("Syncing hls assets with remote")
	utils.Rclone("copy", []string{packagedDir, e.RcloneDest + "/hls"}, utils.Config.RcloneConfig)

	fmt.Println("Syncing logs with remote")
	utils.Rclone("copy", []string{tmpDir + "/logs", e.RcloneDest + "/logs"}, utils.Config.RcloneConfig)

	fmt.Println("Setting status completed")
	tidalMeta.HLSMasterLink = fmt.Sprintf("%s/hls/master.m3u8", e.RcloneDest)
	tidalMeta.Status = "completed"
	utils.UpsertTidalMeta(&tidalMeta, e.WebhookURL)
}
