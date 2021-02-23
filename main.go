package main

import (
	"log"
	"os"
	"strings"

	"github.com/bken-io/tidal/src/commands"
	"github.com/bken-io/tidal/src/utils"
	"github.com/minio/minio-go/v7"
	"github.com/spf13/cobra"
)

func collectS3Args(cmd *cobra.Command, option string) *minio.Client {
	if option == "in" {
		inEndpoint, err := cmd.Flags().GetString("inEndpoint")
		if err != nil {
			log.Fatal("failed to collect inEndpoint")
		}

		inAccessKeyID, err := cmd.Flags().GetString("inAccessKeyId")
		if err != nil {
			log.Fatal("failed to collect inAccessKeyId")
		}

		inSecretAccessKey, err := cmd.Flags().GetString("inSecretAccessKey")
		if err != nil {
			log.Fatal("failed to collect inSecretAccessKey")
		}

		return utils.CreateClient(utils.S3Config{
			Endpoint:        inEndpoint,
			AccessKeyID:     inAccessKeyID,
			SecretAccessKey: inSecretAccessKey,
		})
	} else if option == "out" {
		outEndpoint, err := cmd.Flags().GetString("outEndpoint")
		if err != nil {
			log.Fatal("failed to collect outEndpoint")
		}

		outAccessKeyID, err := cmd.Flags().GetString("outAccessKeyId")
		if err != nil {
			log.Fatal("failed to collect outAccessKeyId")
		}

		outSecretAccessKey, err := cmd.Flags().GetString("outSecretAccessKey")
		if err != nil {
			log.Fatal("failed to collect outSecretAccessKey")
		}

		return utils.CreateClient(utils.S3Config{
			Endpoint:        outEndpoint,
			AccessKeyID:     outAccessKeyID,
			SecretAccessKey: outSecretAccessKey,
		})
	}

	return nil
}

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
		Use:   "thumbnail [s3://path-to-source] [s3://-path-to-destination]",
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
		Use:   "ingest [s3://path-to-source]",
		Short: "Ingest a video file into Tidal",
		Args:  cobra.MinimumNArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			event := commands.IngestVideoEvent{
				InURI:  args[0],
				OutURI: args[1],
			}

			if strings.Contains(event.InURI, "s3://") {
				event.InS3Client = collectS3Args(cmd, "in")
			}

			if strings.Contains(event.OutURI, "s3://") {
				event.OutS3Client = collectS3Args(cmd, "out")
			}

			commands.IngestVideo(event)
		},
	}

	var transcodeCmd = &cobra.Command{
		Use:   "transcode [source-segment destination-segment]",
		Short: "Transcode a video segment given the specified command",
		Args:  cobra.MinimumNArgs(2),
		Run: func(cmd *cobra.Command, args []string) {
			ffmpegCommand, _ := cmd.Flags().GetString("cmd")

			event := commands.TranscodeInputEvent{
				InURI:  args[0],
				OutURI: args[1],
				Cmd:    ffmpegCommand,
			}

			if strings.Contains(event.InURI, "s3://") {
				event.InS3Client = collectS3Args(cmd, "in")
			}

			if strings.Contains(event.OutURI, "s3://") {
				event.OutS3Client = collectS3Args(cmd, "out")
			}

			commands.Transcode(event)
		},
	}

	var packageCmd = &cobra.Command{
		Use:   "package [s3://tidal/$id/versions/$preset/segments/ s3://cdn.bken.io/$id/hls/$preset]",
		Short: "Package a single video preset",
		Args:  cobra.MinimumNArgs(2),
		Run: func(cmd *cobra.Command, args []string) {
			packageEvent := commands.GenPackageEvent(
				commands.PackageInputEvent{
					S3In:  args[0],
					S3Out: args[1],
				})
			commands.Package(packageEvent)
		},
	}

	var rootCmd = &cobra.Command{Use: "tidal"}
	rootCmd.AddCommand(ingestCmd)
	ingestCmd.Flags().String("videoId", "", "videoId used to store assets in tidal")

	rootCmd.AddCommand(transcodeCmd)
	transcodeCmd.Flags().String("cmd", "", "the ffmpeg command to run")
	transcodeCmd.Flags().String("videoId", "", "videoId used to store assets in tidal")
	transcodeCmd.Flags().String("presetName", "", "presetName that is being transcoded")

	rootCmd.AddCommand(presetsCmd)

	rootCmd.AddCommand(packageCmd)

	rootCmd.AddCommand(thumbnailCmd)
	thumbnailCmd.Flags().String("cmd", "", "ffmpeg thumbnail command")

	rootCmd.Execute()
}
