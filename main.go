package main

import (
	"strings"

	"github.com/bken-io/tidal/src/services"
	"github.com/bken-io/tidal/src/utils"
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
			ffmpegCmd, _ := cmd.Flags().GetString("cmd")
			endpoint, _ := cmd.Flags().GetString("endpoint")
			accessKeyID, _ := cmd.Flags().GetString("accessKeyId")
			secretAccessKey, _ := cmd.Flags().GetString("secretAccessKey")

			if ffmpegCmd == "" {
				ffmpegCmd = "-vf scale=854:480:force_original_aspect_ratio=increase,crop=854:480 -vframes 1 -q:v 50"
			}

			event := utils.ThumbnailInput{
				S3In:  args[0],
				S3Out: args[1],
				Cmd:   ffmpegCmd,
				S3Config: utils.S3Config{
					Endpoint:        endpoint,
					AccessKeyID:     accessKeyID,
					SecretAccessKey: secretAccessKey,
				},
			}
			services.GenerateThumbnail(event)
		},
	}

	var rootCmd = &cobra.Command{Use: "tidal"}
	rootCmd.AddCommand(presetsCmd)
	rootCmd.AddCommand(thumbnailCmd)

	thumbnailCmd.Flags().String("cmd", "", "ffmpeg thumbnail command")
	thumbnailCmd.Flags().String("endpoint", "", "the aws endpoint to use")
	thumbnailCmd.Flags().String("accessKeyId", "", "the accessKeyId to use")
	thumbnailCmd.Flags().String("secretAccessKey", "", "the secretAccessKey to use")
	rootCmd.Execute()
}
