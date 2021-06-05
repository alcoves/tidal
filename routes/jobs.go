package routes

import (
	"github.com/bkenio/tidal/utils"
	"github.com/gofiber/fiber/v2"
)

func PostTranscode(c *fiber.Ctx) error {
	job := new(utils.VideoJob)
	if err := c.BodyParser(job); err != nil {
		return err
	}
	utils.Dispatch("transcode", map[string]string{
		"video_id":               job.VideoID,
		"webhook_url":            job.WebhookURL,
		"rclone_source_uri":      job.RcloneSourceURI,
		"rclone_destination_uri": job.RcloneDestinationURI,
	})
	return c.SendStatus(202)
}

func PostThumbnail(c *fiber.Ctx) error {
	job := new(utils.VideoJob)
	if err := c.BodyParser(job); err != nil {
		return err
	}
	utils.Dispatch("thumbnail", map[string]string{
		"video_id":               job.VideoID,
		"webhook_url":            job.WebhookURL,
		"rclone_source_uri":      job.RcloneSourceURI,
		"rclone_destination_uri": job.RcloneDestinationURI,
	})
	return c.SendStatus(202)
}
