package commands

import (
	"fmt"

	"github.com/bkenio/tidal/internal/nomad"
	"github.com/gofiber/fiber/v2"
)

func healthCheck(c *fiber.Ctx) error {
	return c.SendString("up")
}

// ProcessVideoRequest dispatches a video ingest job
func ProcessVideoRequest(c *fiber.Ctx) error {
	input := new(ProcessVideoInput)
	if err := c.BodyParser(input); err != nil {
		return c.Status(400).SendString("video input failed unmarshalling")
	}

	jobMeta := []string{
		fmt.Sprintf(`rclone_source_file=%s`, input.RcloneSourceFile),
		fmt.Sprintf(`rclone_dest_dir=%s`, input.RcloneDestinationDir),
	}
	nomad.Dispatch("ingest", jobMeta)
	return c.SendString("video ingest running")
}

// SetupRoutes contrcuts consumable routes for fiber to use
func SetupRoutes(app *fiber.App) {
	app.Get("/", healthCheck)
	app.Post("/ingest", ProcessVideoRequest)
}
