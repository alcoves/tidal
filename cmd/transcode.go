package cmd

import (
	"io/ioutil"
	"os"

	"github.com/bkenio/tidal/utils"
	log "github.com/sirupsen/logrus"
)

func generateTranscodeArguments(job *utils.VideoJob) []string {
	mpdOutputPath := job.JobDir + "/output.mpd"
	transcodeArgs := []string{"-hide_banner", "-y", "-i", job.SignedURL}

	for i := 0; i < len(job.Presets); i++ {
		transcodeArgs = append(transcodeArgs, "-map", "0:v:0", "-map", "0:a?:0")
	}
	for i := 0; i < len(job.Presets); i++ {
		preset := job.Presets[i]
		transcodeArgs = append(transcodeArgs, utils.X264(job.Metadata, preset, i)...)
		// transcodeArgs = append(transcodeArgs, utils.VP9(job.Metadata, preset, i)...)
	}

	transcodeArgs = append(transcodeArgs,
		"-pix_fmt", "yuv420p",
		"-force_key_frames", "expr:gte(t,n_forced*2)",
		"-use_timeline", "1", "-use_template", "1",
		"-dash_segment_type", "mp4", "-hls_playlist", "1",
		"-seg_duration", "2", "-streaming", "1",
		"-adaptation_sets", "id=0,streams=v id=1,streams=a",
		mpdOutputPath,
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
		"mpdLink":          job.RcloneDestinationURI + "/output.mpd",
	})
}
