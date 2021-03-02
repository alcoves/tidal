package main

import (
	"github.com/bkenio/tidal/internal/commands"
	"github.com/spf13/cobra"
)

func main() {
	var api = &cobra.Command{
		Use:   "api",
		Short: "Runs the tidal api server",
		Args:  cobra.MinimumNArgs(0),
		Run: func(cmd *cobra.Command, args []string) {
			commands.API()
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
