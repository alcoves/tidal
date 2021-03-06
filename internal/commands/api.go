package commands

import (
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/bkenio/tidal/internal/nomad"
	"github.com/bkenio/tidal/internal/utils"
	"github.com/gofiber/fiber/v2"
)

type processVideoInput struct {
	TidalConfigDir       string `json:"tidalConfigDir"`
	RcloneSourceFile     string `json:"rcloneSourceFile"`
	RcloneDestinationDir string `json:"rcloneDestinationDir"`
}

func healthCheck(c *fiber.Ctx) error {
	return c.SendString("up")
}

func readDirRec(path string) {
	err := filepath.Walk(path,
		func(path string, info os.FileInfo, err error) error {
			if err != nil {
				panic(err)
			}
			fmt.Println(info.Name())
			return nil
		})
	if err != nil {
		log.Println(err)
	}
}

// ProcessVideoRequest dispatches a video ingest job
func ProcessVideoRequest(c *fiber.Ctx) error {
	i := new(processVideoInput)
	if err := c.BodyParser(i); err != nil {
		return c.Status(400).SendString("video input failed unmarshalling")
	}
	jobMeta := []string{
		fmt.Sprintf(`tidal_config_dir=%s`, i.TidalConfigDir),
		fmt.Sprintf(`rclone_source_file=%s`, i.RcloneSourceFile),
		fmt.Sprintf(`rclone_dest_dir=%s`, i.RcloneDestinationDir),
	}
	fmt.Println("ingest", jobMeta)
	nomad.Dispatch("ingest", jobMeta, utils.Config.NomadToken)
	return c.SendString("video ingest running")
}

func GetVideo(c *fiber.Ctx) error {
	readDirRec(fmt.Sprintf("/tmp/tidal/"))
	// Reads dir from disk
	// Computes status
	videoID := c.Params("id")
	return c.SendString(videoID)
}

// SetupRoutes contrcuts consumable routes for fiber to use
func SetupRoutes(app *fiber.App) {
	app.Get("/", healthCheck)
	app.Post("/ingest", ProcessVideoRequest)
	app.Get("/videos/:id", GetVideo)
}
