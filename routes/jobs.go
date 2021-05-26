package routes

import (
	"fmt"

	"github.com/bkenio/tidal/utils"
	"github.com/gofiber/fiber/v2"
)

func PostJob(c *fiber.Ctx) error {
	job := new(Job)
	if err := c.BodyParser(job); err != nil {
		return err
	}

	fmt.Println("Getting metadata")
	metadata := utils.GetMetadata("https://cdn.bken.io/tests/with-audio.mp4")
	fmt.Println("metadata", metadata)

	fmt.Println("Generating presets")
	// Generate presets

	// Segment video

	// Transcode segments

	// Wait for completion

	// Concatinate presets

	// Package MPEG Dash

	// Upload to CDN

	return c.JSON(job)
}
