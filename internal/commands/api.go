package commands

import (
	"fmt"

	"github.com/bkenio/tidal/internal/nomad"
	"github.com/bkenio/tidal/internal/utils"
	"github.com/gofiber/fiber/v2"
)

type processVideoInput struct {
	TidalDir             string `json="tidalDir"`
	NomadToken           string `json="nomadToken"`
	RcloneConfig         string `json="rcloneConfig"`
	RcloneSourceFile     string `json="rcloneSourceFile"`
	RcloneDestinationDir string `json="rcloneDestinationDir"`
}

func healthCheck(c *fiber.Ctx) error {
	return c.SendString("up")
}

// ProcessVideoRequest dispatches a video ingest job
func ProcessVideoRequest(c *fiber.Ctx) error {
	i := new(processVideoInput)
	if err := c.BodyParser(i); err != nil {
		return c.Status(400).SendString("video input failed unmarshalling")
	}
	config := utils.NewConfig(i.TidalDir, i.NomadToken, i.RcloneConfig)
	jobMeta := []string{
		fmt.Sprintf(`tidal_dir=%s`, config.TidalDir),
		fmt.Sprintf(`nomad_token=%s`, config.NomadToken),
		fmt.Sprintf(`rclone_config=%s`, config.RcloneConfig),
		fmt.Sprintf(`rclone_source_file=%s`, i.RcloneSourceFile),
		fmt.Sprintf(`rclone_dest_dir=%s`, i.RcloneDestinationDir),
	}
	nomad.Dispatch("ingest", jobMeta, config.NomadToken)
	return c.SendString("video ingest running")
}

// SetupRoutes contrcuts consumable routes for fiber to use
func SetupRoutes(app *fiber.App) {
	app.Get("/", healthCheck)
	app.Post("/ingest", ProcessVideoRequest)
}
