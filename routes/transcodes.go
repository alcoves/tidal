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

	if job.Async == true {
		go cmd.Transcode(job)
		return c.SendStatus(202)
	} else {
		cmd.Transcode(job)
		return c.SendStatus(200)
	}
}
