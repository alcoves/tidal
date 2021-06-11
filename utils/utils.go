package utils

import (
	"fmt"
	"math"
	"os/exec"
	"strconv"
	"strings"

	log "github.com/sirupsen/logrus"
)

func round(num float64) int {
	return int(num + math.Copysign(0.5, num))
}

func toFixed(num float64, precision int) float64 {
	output := math.Pow(10, float64(precision))
	return float64(round(num*output)) / output
}

// CalcMaxBitrate uses the videos original bitrate to determine what the max should be
func CalcMaxBitrate(originalWidth int, desiredWidth int, bitrate int) int {
	vidRatio := float64(desiredWidth) / float64(originalWidth)
	return int(vidRatio * float64(bitrate) / 1000)
}

// CalculateResizeFilter returns an ffmpeg VideoMetadata filter
func CalculateResizeFilter(presetWidth int) string {
	return fmt.Sprintf("scale=trunc(iw/2)*2:trunc(ih/2)*2,scale=%d:%d:force_original_aspect_ratio=decrease", presetWidth, presetWidth)
}

// ClampPreset checks if the VideoMetadata fits the specified dimensions
func ClampPreset(w int, h int, dw int, dh int) bool {
	if (w >= dw && h >= dh) || (w >= dh && h >= dw) {
		return true
	}
	return false
}

// ParseFramerate converts an ffmpeg framerate string to a float64
func ParseFramerate(fr string) float64 {
	var parsedFramerate float64 = 0

	if strings.Contains(fr, "/") {
		slice := strings.Split(fr, "/")

		frameFrequency, err := strconv.ParseFloat(slice[0], 64)
		if err != nil {
			log.Panic(err)
		}
		timeInterval, err := strconv.ParseFloat(slice[1], 64)
		if err != nil {
			log.Panic(err)
		}

		parsedFramerate = toFixed(frameFrequency/timeInterval, 3)
	} else {
		fr, err := strconv.ParseFloat(fr, 64)
		if err != nil {
			log.Panic(err)
		}
		parsedFramerate = fr
	}

	if parsedFramerate > 60 {
		return 60
	}
	return parsedFramerate
}

// GetMetadata uses ffprobe to return VideoMetadata metadata
func GetMetadata(URI string) VideoMetadata {
	log.Debug("Getting metadata")
	ffprobeCmds := []string{
		"-loglevel", "quiet",
		"-select_streams", "v",
		"-show_entries", "format=duration",
		"-of", "default=noprint_wrappers=1",
		"-show_entries", "stream=width,height,r_frame_rate,bit_rate",
		URI,
	}

	cmd := exec.Command("ffprobe", ffprobeCmds...)
	out, err := cmd.CombinedOutput()
	if err != nil {
		log.Fatal(err)
	}

	metadataSplit := strings.Split(string(out), "\n")
	metadata := new(VideoMetadata)

	for i := 0; i < len(metadataSplit); i++ {
		metaTupleSplit := strings.Split(metadataSplit[i], "=")
		if len(metaTupleSplit) <= 1 {
			break
		}

		var key string = metaTupleSplit[0]
		var value string = metaTupleSplit[1]

		if key == "duration" {
			duration, err := strconv.ParseFloat(value, 32)
			if err != nil {
				log.Panic(err)
			}
			metadata.Duration = float64(duration)
		} else if key == "width" {
			width, err := strconv.Atoi(value)
			if err != nil {
				log.Panic(err)
			}
			metadata.Width = int(width)
		} else if key == "height" {
			height, err := strconv.Atoi(value)
			if err != nil {
				log.Panic(err)
			}
			metadata.Height = int(height)
		} else if key == "bit_rate" {
			bitrate, err := strconv.Atoi(value)
			if err != nil {
				fmt.Println("Failed to parse bitrate, falling back to 0")
				bitrate = 0
			}
			metadata.Bitrate = int(bitrate)
		} else if key == "r_frame_rate" {
			metadata.Framerate = ParseFramerate(value)
		}
	}

	log.Debug("Metadata", fmt.Sprintf("Metadata: %+v", metadata))
	return *metadata
}
