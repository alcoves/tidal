package routes

import (
	"fmt"

	"github.com/bkenio/tidal/utils"
	"github.com/gofiber/fiber/v2"
	log "github.com/sirupsen/logrus"
)

type PostTranscodeInput struct {
	JobDir               string `json:"jobDir"`
	VideoID              string `json:"videoId"`
	RcloneSourceURI      string `json:"rcloneSourceURI"`
	RcloneDestinationURI string `json:"rcloneDestinationURI"`
}

func PostTranscodes(c *fiber.Ctx) error {
	transcodeInput := new(PostTranscodeInput)
	if err := c.BodyParser(transcodeInput); err != nil {
		return err
	}

	log.Info("Obtaining signed URL")
	signedUrl := utils.RcloneCmd([]string{"link", transcodeInput.RcloneSourceURI})
	metadata := utils.GetMetadata(signedUrl)
	presets := utils.GetPresets(metadata)

	log.Debug("presets", presets)

	log.Info("Transcoding video")
	transcodeArgs := []string{"ffmpeg", "-hide_banner", "-y", "-i", fmt.Sprintf(`"%s"`, signedUrl)}

	for i := 0; i < len(presets); i++ {
		transcodeArgs = append(transcodeArgs, "-map", "0:v:0", "-map", "0:a\\?:0")
	}

	for i := 0; i < len(presets); i++ {
		preset := presets[i]
		log.Info(preset.Width)
		transcodeArgs = append(transcodeArgs, utils.X264(metadata, preset.Width, i))
	}

	transcodeArgs = append(transcodeArgs, "-use_timeline", "1", "-use_template", "1", "-adaptation_sets", "'id=0,streams=v id=1,streams=a'")
	transcodeArgs = append(transcodeArgs, "./tmp/output.mpd")

	// Invokes ffmpeg
	utils.Ffmpeg(transcodeArgs)

	log.Info("Publishing video assets")
	utils.RcloneCmd([]string{
		"copy",
		transcodeInput.JobDir,
		transcodeInput.RcloneDestinationURI,
	})

	return c.SendString("Done transcoding")
}
