package routes

import (
	"github.com/bkenio/tidal/cmd"
	"github.com/bkenio/tidal/utils"
	"github.com/gofiber/fiber/v2"
)

func PostTranscode(c *fiber.Ctx) error {
	job := new(utils.TranscodeJob)
	if err := c.BodyParser(job); err != nil {
		return err
	}

	if job.Async {
		utils.Dispatch("transcode", map[string]string{
			"video_id":               job.VideoID,
			"webhook_url":            job.WebhookURL,
			"rclone_source_uri":      job.RcloneSourceURI,
			"rclone_destination_uri": job.RcloneDestinationURI,
		})
		return c.SendStatus(202)
	} else {
		cmd.Transcode(job)
		return c.SendStatus(200)
	}
}
