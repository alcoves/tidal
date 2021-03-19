package commands

import (
	"fmt"
	"path/filepath"

	"github.com/bkenio/tidal/internal/nomad"
	"github.com/bkenio/tidal/internal/utils"
	"github.com/gofiber/fiber/v2"
)

type processVideoInput struct {
	RcloneSource string `json:"rcloneSource"`
	RcloneDest   string `json:"rcloneDest"`
	WebhookURL   string `json:"webhookURL"`
}

func healthCheck(c *fiber.Ctx) error {
	return c.SendString("up")
}

// CreateThumbnailRequest proxies the thumbnail creation subcommand to the api
func CreateThumbnailRequest(c *fiber.Ctx) error {
	i := new(CreateThumbnailEvent)
	if err := c.BodyParser(i); err != nil {
		return c.Status(400).SendString("video input failed unmarshalling")
	}

	// TODO :: Check payload for null values

	thumbnailPayload := []string{
		fmt.Sprintf(`rclone_source=%s`, i.RcloneSource),
		fmt.Sprintf(`rclone_dest=%s`, i.RcloneDest),
	}
	fmt.Println("thumbnail", thumbnailPayload)
	nomad.Dispatch("thumbnail", thumbnailPayload, utils.Config.NomadToken)
	return c.SendString("video thumbnail running")
}

// ProcessVideoRequest dispatches a video ingest job
func ProcessVideoRequest(c *fiber.Ctx) error {
	i := new(processVideoInput)
	if err := c.BodyParser(i); err != nil {
		return c.Status(400).SendString("video input failed unmarshalling")
	}

	// TODO :: Check payload for null values

	srcFilename := filepath.Base(i.RcloneSource)
	srcExists := utils.Rclone("lsf", []string{i.RcloneSource}, utils.Config.RcloneConfig)
	if srcFilename != srcExists {
		errMsg := "rclone source file not found"
		return c.Status(400).SendString(errMsg)
	}

	// TODO :: Check that remote exists

	ingestPayload := []string{
		fmt.Sprintf(`rclone_source=%s`, i.RcloneSource),
		fmt.Sprintf(`rclone_dest=%s`, i.RcloneDest),
		fmt.Sprintf(`webhook_url=%s`, i.WebhookURL),
	}
	fmt.Println("ingest", ingestPayload)
	nomad.Dispatch("ingest", ingestPayload, utils.Config.NomadToken)
	return c.SendString("video ingest running")
}

// SetupRoutes contrcuts consumable routes for fiber to use
func SetupRoutes(app *fiber.App) {
	app.Get("/", healthCheck)
	app.Post("/videos", ProcessVideoRequest)
	app.Post("/videos/thumbnails", CreateThumbnailRequest)
}
