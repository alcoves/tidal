package cmd

import (
	"io/ioutil"
	"os"
	"path/filepath"

	"github.com/bkenio/tidal/utils"
	log "github.com/sirupsen/logrus"
)

func generateThumbnailArguments(job *utils.VideoJob, thumbnailName string) []string {
	thumbnailOutputPath := job.JobDir + "/" + thumbnailName
	transcodeArgs := []string{
		"-hide_banner", "-y", "-i", job.SignedURL,
		"-vf", "scale=854:480:force_original_aspect_ratio=increase,crop=854:480",
		"-vframes", "1", "-q:v", "50", thumbnailOutputPath,
	}
	return transcodeArgs
}

func Thumbnail(job *utils.VideoJob) {
	log.Debug("Thumbnailing")
	thumbnailName := filepath.Base(job.RcloneDestinationURI)
	tmpDir, err := ioutil.TempDir("/tmp", "tidal-transcode-")
	if err != nil {
		log.Fatal(err)
	}
	job.JobDir = tmpDir
	log.Debug("Job Dir", job.JobDir)
	job.SignedURL = utils.RcloneCmd([]string{"link", job.RcloneSourceURI})

	ffArgs := generateThumbnailArguments(job, thumbnailName)
	utils.Ffmpeg(ffArgs, job, false)

	utils.RcloneCmd([]string{
		"copyto",
		job.JobDir + "/" + thumbnailName,
		job.RcloneDestinationURI,
	})

	defer os.RemoveAll(tmpDir)

	utils.Notify(job.WebhookURL, map[string]interface{}{
		"thumbnail": utils.RcloneCmd([]string{"link", job.RcloneDestinationURI}),
	})
}
