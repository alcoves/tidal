package main

import (
	log "github.com/sirupsen/logrus"

	"github.com/bkenio/tidal/routes"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"
)

func setupRoutes(app *fiber.App) {
	api := app.Group("/", logger.New())
	api.Get("/", routes.GetRoot)
	api.Get("/config", routes.GetConfig)
	api.Put("/config", routes.PutConfig)
	api.Post("/transcodes", routes.PostTranscodes)
}

func main() {
	log.SetLevel(log.DebugLevel)
	godotenv.Load(".env")

	app := fiber.New()
	app.Use(cors.New())
	app.Use(recover.New())

	setupRoutes(app)
	log.Panic(app.Listen(":4000"))
}
