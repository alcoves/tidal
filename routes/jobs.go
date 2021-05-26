package routes

import (
	"fmt"

	"github.com/bkenio/tidal/utils"
	"github.com/gofiber/fiber/v2"
)

func PostJob(c *fiber.Ctx) error {
	job := new(utils.Job)
	if err := c.BodyParser(job); err != nil {
		return err
	}

	fmt.Println("Getting metadata")
	job.Metadata = utils.GetMetadata("https://cdn.bken.io/tests/with-audio.mp4")
	fmt.Printf("Job Metadata: %+v\n", job.Metadata)

	fmt.Println("Generating presets")
	job.Presets = utils.GetPresets(job.Metadata)
	fmt.Printf("Job Presets: %+v\n", job.Presets)

	// Segment video
	segRes := utils.SegmentVideo(utils.SegmentationRequest{
		TmpDir:    job.TmpDir,
		Metadata:  job.Metadata,
		SourceURI: "https://cdn.bken.io/tests/with-audio.mp4",
	})
	fmt.Println("segRes", segRes)

	// Transcode segments

	// Wait for completion

	// Concatinate presets

	// Package MPEG Dash

	// Upload to CDN
	// publishRes := utils.RcloneCmd([]string{
	// 	"sync",
	// 	job.TmpDir,
	// 	job.RcloneDestinationURI,
	// })
	// fmt.Println("publishRes", publishRes)

	return c.JSON(job)
}
