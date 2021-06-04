package routes

import (
	"fmt"
	"io/ioutil"
	"os"

	"github.com/bkenio/tidal/utils"
	"github.com/gofiber/fiber/v2"
	log "github.com/sirupsen/logrus"
)

func generateTranscodeArguments(job *utils.TranscodeJob) []string {
	mpdOutputPath := job.JobDir + "/output.mpd"
	transcodeArgs := []string{"ffmpeg", "-hide_banner", "-y", "-i", fmt.Sprintf(`"%s"`, job.SignedURL)}

	for i := 0; i < len(job.Presets); i++ {
		transcodeArgs = append(transcodeArgs, "-map", "0:v:0", "-map", "0:a\\?:0")
	}

	for i := 0; i < len(job.Presets); i++ {
		preset := job.Presets[i]
		log.Info(preset.Width)
		transcodeArgs = append(transcodeArgs, utils.X264(job.Metadata, preset.Width, i))
	}

	transcodeArgs = append(transcodeArgs, "-use_timeline", "1", "-use_template", "1", "-adaptation_sets", "'id=0,streams=v id=1,streams=a'", mpdOutputPath)
	return transcodeArgs
}

func PostTranscodes(c *fiber.Ctx) error {
	job := new(utils.TranscodeJob)
	if err := c.BodyParser(job); err != nil {
		return err
	}

	tmpDir, err := ioutil.TempDir("/tmp", "tidal-transcode-")
	if err != nil {
		log.Fatal(err)
	}
	job.JobDir = tmpDir
	log.Debug("Job Dir", job.JobDir)

	job.Status = "started"
	utils.Notify(job)

	job.SignedURL = utils.RcloneCmd([]string{"link", job.RcloneSourceURI})
	job.Metadata = utils.GetMetadata(job.SignedURL)
	job.Presets = utils.GetPresets(job.Metadata)
	utils.Ffmpeg(generateTranscodeArguments(job))

	utils.RcloneCmd([]string{
		"copy",
		job.JobDir,
		job.RcloneDestinationURI,
	})

	job.MPDLink = job.RcloneDestinationURI + "/output.mpd"
	job.Status = "completed"
	utils.Notify(job)

	defer os.RemoveAll(tmpDir)
	return c.SendString("Done transcoding")
}
