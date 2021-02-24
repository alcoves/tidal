package main

import (
	"github.com/bken-io/tidal/src/commands"
	"github.com/spf13/cobra"
)

func main() {
	var pipelineCmd = &cobra.Command{
		Use:   "ingest [source:path dest:path]",
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
	rootCmd.AddCommand(pipelineCmd)
	rootCmd.Execute()
}
