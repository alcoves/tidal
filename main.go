package main

import (
	"strings"

	"github.com/bken-io/tidal/src/services"
	"github.com/spf13/cobra"
)

func main() {
	var presetsCmd = &cobra.Command{
		Use:   "presets [path to file]",
		Short: "Generate video presets",
		Args:  cobra.MinimumNArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			inputPath := strings.Join(args, " ")
			services.CalculatePresets(inputPath)
		},
	}

	var thumbnailCmd = &cobra.Command{
		Use:   "thumbnail [path to file]",
		Short: "Generate video thumbnail",
		Args:  cobra.MinimumNArgs(2),
		Run: func(cmd *cobra.Command, args []string) {
			inputPath := strings.Join(args, " ")
			ffmpegCmd, _ := cmd.Flags().GetString("cmd")
			awsProfile, _ := cmd.Flags().GetString("profile")
			services.GenerateThumbnail(services.ThumbnailInput)
		},
	}

	var rootCmd = &cobra.Command{Use: "tidal"}
	rootCmd.AddCommand(presetsCmd)
	rootCmd.AddCommand(thumbnailCmd)

	thumbnailCmd.Flags().String("cmd", "", "ffmpeg thumbnail command")
	rootCmd.Execute()
}
