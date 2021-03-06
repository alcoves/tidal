package commands

import (
	"fmt"
	"io/fs"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/bkenio/tidal/internal/nomad"
	"github.com/bkenio/tidal/internal/utils"
	"github.com/gofiber/fiber/v2"
)

type processVideoInput struct {
	RcloneSourceFile     string `json:"rcloneSourceFile"`
	RcloneDestinationDir string `json:"rcloneDestinationDir"`
}

func healthCheck(c *fiber.Ctx) error {
	return c.SendString("up")
}

func readDirRec(path string) []fs.FileInfo {
	files := []fs.FileInfo{}

	err := filepath.Walk(path,
		func(path string, info os.FileInfo, err error) error {
			if err != nil {
				panic(err)
			}
			files = append(files, info)
			return nil
		})
	if err != nil {
		log.Println(err)
	}

	return files
}

// ProcessVideoRequest dispatches a video ingest job
func ProcessVideoRequest(c *fiber.Ctx) error {
	i := new(processVideoInput)
	if err := c.BodyParser(i); err != nil {
		return c.Status(400).SendString("video input failed unmarshalling")
	}

	srcFilename := filepath.Base(i.RcloneSourceFile)
	srcExists := utils.Rclone("lsf", []string{i.RcloneSourceFile}, utils.Config.RcloneConfig)
	srcExists = strings.Replace(srcExists, "\n", "", -1)
	if srcFilename != srcExists {
		errMsg := "rclone source file not found"
		return c.Status(400).SendString(errMsg)
	}

	// TODO :: Check that remote exists

	ingestPayload := []string{
		fmt.Sprintf(`rclone_source_file=%s`, i.RcloneSourceFile),
		fmt.Sprintf(`rclone_dest_dir=%s`, i.RcloneDestinationDir),
	}
	fmt.Println("ingest", ingestPayload)
	nomad.Dispatch("ingest", ingestPayload, utils.Config.NomadToken)
	return c.SendString("video ingest running")
}

func GetVideo(c *fiber.Ctx) error {
	videoID := c.Params("id")
	files := readDirRec(fmt.Sprintf("/tmp/tidal/tmp/%s", videoID))

	// read source-segments dir
	// read transcoded-segments. 360, 720
	// return { id: "", presets: [{ id: "", percentCompleted: 0 }, {}, {}] }

	for i := 0; i < len(files); i++ {
		fmt.Println(files[i].Name())
	}

	// Reads dir from disk
	// Computes status
	return c.SendString(videoID)
}

// SetupRoutes contrcuts consumable routes for fiber to use
func SetupRoutes(app *fiber.App) {
	app.Get("/", healthCheck)
	app.Get("/videos/:id", GetVideo)
	app.Post("/videos", ProcessVideoRequest)
}
