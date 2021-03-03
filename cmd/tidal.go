package main

import (
	"log"

	"github.com/bkenio/tidal/internal/commands"
	"github.com/bkenio/tidal/internal/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/spf13/cobra"
)

func main() {
	var apiCommand = &cobra.Command{
		Use:   "api",
		Short: "Runs the tidal api server",
		Args:  cobra.MinimumNArgs(0),
		Run: func(cmd *cobra.Command, args []string) {
			port, _ := cmd.Flags().GetString("port")
			app := fiber.New()
			app.Use(cors.New())
			app.Use(recover.New())
			commands.SetupRoutes(app)
			log.Panic(app.Listen(":" + port))
		},
	}

	var ingest = &cobra.Command{
		Use:   "ingest [rclone_source rclone_dest]",
		Short: "Runs full video encode pipeline",
		Args:  cobra.MinimumNArgs(2),
		Run: func(cmd *cobra.Command, args []string) {
			tidalDir, _ := cmd.Flags().GetString("tidalDir")
			nomadToken, _ := cmd.Flags().GetString("nomadToken")
			rcloneConfig, _ := cmd.Flags().GetString("rcloneConfig")
			c := utils.NewConfig(tidalDir, nomadToken, rcloneConfig)

			commands.Pipeline(commands.PipelineEvent{
				Config:       c,
				RcloneSource: args[0],
				RcloneDest:   args[1],
			})
		},
	}

	var tidalDir string
	var nomadToken string
	var rcloneConfig string

	var rootCmd = &cobra.Command{Use: "tidal"}
	rootCmd.PersistentFlags().StringVar(&tidalDir, "tidalDir", "", "directory that tidal uses for processing media")
	rootCmd.PersistentFlags().StringVar(&nomadToken, "nomadToken", "", "Nomad ACL token used to enqueue jobs")
	rootCmd.PersistentFlags().StringVar(&rcloneConfig, "rcloneConfig", "", "rclone config path")

	rootCmd.AddCommand(apiCommand)
	apiCommand.Flags().String("port", "4000", "port the tidal api server should run on")

	rootCmd.AddCommand(ingest)
	rootCmd.Execute()
}
