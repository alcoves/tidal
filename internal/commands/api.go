package commands

import (
	"log"
	"os"

	"github.com/bkenio/tidal/api/jobs"
	"github.com/bkenio/tidal/internal/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"
)

func healthCheck(c *fiber.Ctx) error {
	return c.SendString("up")
}

func setupRoutes(app *fiber.App) {
	app.Get("/", healthCheck)
	app.Post("/videos", jobs.ProcessVideoRequest)
}

// API runs the tidal api server
func API() {
	godotenv.Load(".env")

	config := utils.Config()
	os.MkdirAll(config.TidalTmpPath, os.ModePerm)

	// TODO :: Make sure config.Rclone path exists

	app := fiber.New()
	app.Use(cors.New())
	app.Use(recover.New())

	setupRoutes(app)
	log.Panic(app.Listen(":4000"))
}
