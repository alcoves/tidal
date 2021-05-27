package routes

import (
	"os"

	"github.com/bkenio/tidal/utils"
	"github.com/gofiber/fiber/v2"
	log "github.com/sirupsen/logrus"
)

func PostJob(c *fiber.Ctx) error {
	log.Debug("Starting job")
	job := new(utils.Job)
	if err := c.BodyParser(job); err != nil {
		return err
	}

	err := os.RemoveAll(job.JobDir)
	if err != nil {
		return err
	}

	job.Metadata = utils.GetMetadata("https://s3.us-east-2.wasabisys.com/cdn.bken.io/tests/1440p-60fps-small/source.mp4")
	job.Presets = utils.GetPresets(job.Metadata)

	segmentationReponse := utils.SegmentVideo(utils.SegmentationRequest{
		JobDir:    job.JobDir,
		Metadata:  job.Metadata,
		SourceURI: "https://s3.us-east-2.wasabisys.com/cdn.bken.io/tests/1440p-60fps-small/source.mp4",
	})

	utils.TranscodeSegments(utils.TranscodeSegmentsRequest{
		JobDir:            job.JobDir,
		Presets:           job.Presets,
		SourceSegmentsDir: segmentationReponse.SourceSegmentsDir,
	})

	utils.ConcatinatePresets(utils.ConcatinatePresetsRequest{
		// SourceAudioPath: "",
		JobDir:  job.JobDir,
		Presets: job.Presets,
	})

	// utils.PackageHLS(utils.PackageHLSRequest{
	// 	JobDir: job.JobDir,
	// })

	utils.RcloneCmd([]string{
		"copy",
		job.JobDir,
		job.RcloneDestinationURI,
	})

	return c.JSON(job)
}
