package main

import (
	"os"
	"strings"

	"github.com/bken-io/tidal/src/commands"
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
			commands.CalculatePresets(inputPath)
		},
	}

	var thumbnailCmd = &cobra.Command{
		Use:   "thumbnail [s3:// path to source] [s3:// path to destination]",
		Short: "Generate video thumbnail",
		Args:  cobra.MinimumNArgs(2),
		Run: func(cmd *cobra.Command, args []string) {
			ffmpegCmd, _ := cmd.Flags().GetString("cmd")

			if ffmpegCmd == "" {
				ffmpegCmd = "-vf scale=854:480:force_original_aspect_ratio=increase,crop=854:480 -vframes 1 -q:v 50"
			}

			event := utils.ThumbnailInput{
				S3In:  args[0],
				S3Out: args[1],
				Cmd:   ffmpegCmd,
				S3InClient: utils.CreateClient(utils.S3Config{
					Endpoint:        os.Getenv("S3_IN_ENDPOINT"),
					AccessKeyID:     os.Getenv("S3_IN_ACCESS_KEY_ID"),
					SecretAccessKey: os.Getenv("S3_IN_SECRET_ACCESS_KEY"),
				}),
				S3OutClient: utils.CreateClient(utils.S3Config{
					Endpoint:        os.Getenv("S3_OUT_ENDPOINT"),
					AccessKeyID:     os.Getenv("S3_OUT_ACCESS_KEY_ID"),
					SecretAccessKey: os.Getenv("S3_OUT_SECRET_ACCESS_KEY"),
				}),
			}
			commands.GenerateThumbnail(event)
		},
	}

	var ingestCmd = &cobra.Command{
		Use:   "ingest [s3:// path to source]",
		Short: "Ingest a video file into Tidal",
		Args:  cobra.MinimumNArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			videoID, _ := cmd.Flags().GetString("videoId")

			event := commands.IngestVideoEvent{
				S3In:    args[0],
				VideoID: videoID,
				S3InClient: utils.CreateClient(utils.S3Config{
					Endpoint:        os.Getenv("S3_IN_ENDPOINT"),
					AccessKeyID:     os.Getenv("S3_IN_ACCESS_KEY_ID"),
					SecretAccessKey: os.Getenv("S3_IN_SECRET_ACCESS_KEY"),
				}),
				S3OutClient: utils.CreateClient(utils.S3Config{
					Endpoint:        os.Getenv("S3_OUT_ENDPOINT"),
					AccessKeyID:     os.Getenv("S3_OUT_ACCESS_KEY_ID"),
					SecretAccessKey: os.Getenv("S3_OUT_SECRET_ACCESS_KEY"),
				}),
			}
			commands.IngestVideo(event)
		},
	}

	var rootCmd = &cobra.Command{Use: "tidal"}
	rootCmd.AddCommand(ingestCmd)
	ingestCmd.Flags().String("videoId", "", "videoId used to store assets in tidal")
	rootCmd.AddCommand(presetsCmd)
	rootCmd.AddCommand(thumbnailCmd)
	thumbnailCmd.Flags().String("cmd", "", "ffmpeg thumbnail command")
	rootCmd.Execute()
}
