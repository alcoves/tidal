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

	signedUrl := utils.RcloneCmd([]string{"link", job.RcloneSourceURI})
	job.Metadata = utils.GetMetadata(signedUrl)
	job.Presets = utils.GetPresets(job.Metadata)

	// Dispatch job and await repsonse
	segmentationReponse := utils.SegmentVideo(utils.SegmentationRequest{
		JobDir:    job.JobDir,
		Metadata:  job.Metadata,
		SourceURI: signedUrl,
	})

	// Splitting source audio could occur in the segmentation stage
	if job.Metadata.HasAudio {
		job.SourceAudioPath = utils.SplitSourceAudio(utils.SplitSourceAudioRequest{
			JobDir:    job.JobDir,
			SourceURI: signedUrl,
		})
	}

	// Dispatch jobs and await responses
	utils.TranscodeSegments(utils.TranscodeSegmentsRequest{
		JobDir:            job.JobDir,
		Presets:           job.Presets,
		SourceSegmentsDir: segmentationReponse.SourceSegmentsDir,
	})

	// Dispatch jobs and await responses
	utils.ConcatinatePresets(utils.ConcatinatePresetsRequest{
		JobDir:          job.JobDir,
		Presets:         job.Presets,
		SourceAudioPath: job.SourceAudioPath,
	})

	// Dispatch job and await response
	utils.PackageHLS(utils.PackageHLSRequest{
		JobDir: job.JobDir,
	})

	utils.RcloneCmd([]string{
		"copy",
		job.JobDir,
		job.RcloneDestinationURI,
	})

	// utils.UpsertTidalMeta(&tidalMeta)
	return c.JSON(job)
}
