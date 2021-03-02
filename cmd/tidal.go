package main

import (
	"log"
	"os"

	"github.com/bkenio/tidal/internal/commands"
	"github.com/bkenio/tidal/internal/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"
	"github.com/spf13/cobra"
)

func main() {
	var api = &cobra.Command{
		Use:   "api",
		Short: "Runs the tidal api server",
		Args:  cobra.MinimumNArgs(0),
		Run: func(cmd *cobra.Command, args []string) {
			godotenv.Load(".env")

			config := utils.Config()
			os.MkdirAll(config.TidalTmpPath, os.ModePerm)

			// TODO :: Make sure config.Rclone path exists

			app := fiber.New()
			app.Use(cors.New())
			app.Use(recover.New())

			commands.SetupRoutes(app)
			log.Panic(app.Listen(":4000"))
		},
	}

	var ingest = &cobra.Command{
		Use:   "ingest [rclone_source rclone_dest]",
		Short: "Runs full video encode pipeline",
		Args:  cobra.MinimumNArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			commands.Pipeline(commands.PipelineEvent{
				RcloneSource: args[0],
				RcloneDest:   args[1],
			})
		},
	}

	var rootCmd = &cobra.Command{Use: "tidal"}
	rootCmd.AddCommand(api)
	rootCmd.AddCommand(ingest)
	rootCmd.Execute()
}
