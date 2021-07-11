package cmd

import (
	"fmt"
	"io/ioutil"
	"os"

	"github.com/bkenio/tidal/utils"
	log "github.com/sirupsen/logrus"
)

const MANIFEST_FILENAME = "manifest.mpd"

func generateTranscodeArguments(job *utils.VideoJob) []string {
	dashManifestPath := fmt.Sprintf("%s/%s", job.JobDir, MANIFEST_FILENAME)
	transcodeArgs := []string{"-hide_banner", "-strict", "-2", "-y", "-i", job.SignedURL}

	for i := 0; i < len(job.Presets); i++ {
		preset := job.Presets[i]
		transcodeArgs = append(transcodeArgs, utils.X264(job.Metadata, preset, i)...)
		// transcodeArgs = append(transcodeArgs, utils.VP9(job.Metadata, preset, i)...)
	}

	// Adding audio tracks
	transcodeArgs = append(transcodeArgs, "-map", "0:a?:0", "-c:a:0", "libopus", "-b:a:0", "128k", "-ar", "48000", "-ac", "2")
	transcodeArgs = append(transcodeArgs, "-map", "0:a?:0", "-c:a:1", "aac", "-b:a:1", "128k", "-ar", "48000", "-ac", "2")

	transcodeArgs = append(transcodeArgs,
		"-pix_fmt", "yuv420p",
		"-force_key_frames", "expr:gte(t,n_forced*2)",
		"-use_timeline", "1", "-use_template", "1",
		"-dash_segment_type", "mp4", "-hls_playlist", "1",
		"-seg_duration", "4", "-streaming", "1",
		"-adaptation_sets", "id=0,streams=v id=1,streams=a",
		"-f", "dash",
		// "-method", "PUT",
		// "http://localhost:5000/ingest/rusty/manifest.mpd",
		dashManifestPath,
	)
	return transcodeArgs
}

func Transcode(job *utils.VideoJob) {
	tmpDir, err := ioutil.TempDir("/tmp", "tidal-transcode-")
	if err != nil {
		log.Fatal(err)
	}
	job.JobDir = tmpDir
	log.Debug("Job Dir", job.JobDir)

	utils.Notify(job.WebhookURL, map[string]interface{}{
		"status": "processing",
	})

	job.SignedURL = utils.RcloneCmd([]string{"link", job.RcloneSourceURI})
	job.Metadata = utils.GetMetadata(job.SignedURL)
	job.Presets = utils.GetPresets(job.Metadata)

	ffArgs := generateTranscodeArguments(job)
	utils.Ffmpeg(ffArgs, job, true)

	utils.Notify(job.WebhookURL, map[string]interface{}{
		"status": "publishing",
	})

	utils.RcloneCmd([]string{
		"copy",
		job.JobDir,
		job.RcloneDestinationURI,
	})

	defer os.RemoveAll(tmpDir)

	utils.Notify(job.WebhookURL, map[string]interface{}{
		"percentCompleted": 100,
		"status":           "completed",
		"mpdLink":          fmt.Sprintf("%s/%s", job.RcloneDestinationURI, MANIFEST_FILENAME),
	})
}
