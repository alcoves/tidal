package main

import (
	"github.com/joho/godotenv"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/cobra"

	"github.com/bkenio/tidal/cmd"
	"github.com/bkenio/tidal/routes"
	"github.com/bkenio/tidal/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func setupRoutes(app *fiber.App) {
	api := app.Group("/", logger.New())
	api.Get("/", routes.GetRoot)
	api.Get("/config", routes.GetConfig)
	api.Put("/config", routes.PutConfig)
	api.Post("/transcodes", routes.PostTranscode)
}

func main() {
	godotenv.Load(".env")
	log.SetLevel(log.DebugLevel)

	var apiCommand = &cobra.Command{
		Use:   "api",
		Short: "Runs the tidal api server",
		Args:  cobra.MinimumNArgs(0),
		Run: func(cobra *cobra.Command, args []string) {
			port, _ := cobra.Flags().GetString("port")
			app := fiber.New()
			app.Use(cors.New())
			app.Use(recover.New())
			setupRoutes(app)
			log.Panic(app.Listen(":" + port))
		},
	}

	var transcodeCommand = &cobra.Command{
		Use:   "transcode",
		Short: "Transcodes a file with ffmpeg",
		Args:  cobra.MinimumNArgs(0),
		Run: func(cobra *cobra.Command, args []string) {
			videoId, _ := cobra.Flags().GetString("videoId")
			webhookUrl, _ := cobra.Flags().GetString("webhookUrl")
			rcloneSourceUri, _ := cobra.Flags().GetString("rcloneSourceUri")
			rcloneDestinationUri, _ := cobra.Flags().GetString("rcloneDestinationUri")

			job := utils.TranscodeJob{
				VideoID:              videoId,
				WebhookURL:           webhookUrl,
				RcloneSourceURI:      rcloneSourceUri,
				RcloneDestinationURI: rcloneDestinationUri,
			}
			cmd.Transcode(&job)
		},
	}

	var rootCmd = &cobra.Command{Use: "tidal"}

	rootCmd.AddCommand(apiCommand)
	apiCommand.Flags().String("port", "4000", "port the tidal api server should run on")

	rootCmd.AddCommand(transcodeCommand)
	transcodeCommand.Flags().String("videoId", "", "the id of the video")
	transcodeCommand.Flags().String("rcloneSourceUri", "", "the rclone source path")
	transcodeCommand.Flags().String("rcloneDestinationUri", "", "the rclone destination")
	transcodeCommand.Flags().String("webhookUrl", "", "the url to deliver event updates to")

	rootCmd.Execute()
}
