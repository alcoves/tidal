package utils

import (
	"fmt"
	"math"
	"os/exec"
	"strconv"
	"strings"

	log "github.com/sirupsen/logrus"
)

// CalculateResizeFilter returns an ffmpeg VideoMetadata filter
func CalculateResizeFilter(videoWidth int, videoHeight int, presetWidth int, presetHeight int) string {
	if videoHeight > videoWidth {
		return fmt.Sprintf("scale=%d:%d:force_original_aspect_ratio=decrease", presetHeight, presetWidth)
	}
	return fmt.Sprintf("scale=%d:%d:force_original_aspect_ratio=decrease", presetWidth, presetHeight)
}

// ClampPreset checks if the VideoMetadata fits the specified dimensions
func ClampPreset(w int, h int, dw int, dh int) bool {
	if (w >= dw && h >= dh) || (w >= dh && h >= dw) {
		return true
	}
	return false
}

// GetPresets returns consumable presets
func GetPresets(v VideoMetadata) []Preset {
	presets := []Preset{
		{
			Name:   "360",
			Width:  640,
			Height: 360,
		},
	}

	if ClampPreset(v.Width, v.Height, 1280, 720) {
		addition := Preset{
			Name:   "720",
			Width:  1280,
			Height: 720,
		}
		presets = append(presets, addition)
	}

	if ClampPreset(v.Width, v.Height, 1920, 1080) {
		addition := Preset{
			Name:   "1080",
			Width:  1920,
			Height: 1080,
		}
		presets = append(presets, addition)
	}

	if ClampPreset(v.Width, v.Height, 2560, 1440) {
		addition := Preset{
			Name:   "1440",
			Width:  2560,
			Height: 1440,
		}
		presets = append(presets, addition)
	}

	if ClampPreset(v.Width, v.Height, 3840, 2160) {
		addition := Preset{
			Name:   "2160",
			Width:  3840,
			Height: 2160,
		}
		presets = append(presets, addition)
	}

	return presets
}

func calcMaxBitrate(originalWidth int, desiredWidth int, bitrate int) int {
	vidRatio := float64(desiredWidth) / float64(originalWidth)
	return int(vidRatio * float64(bitrate) / 1000)
}

func X264(v VideoMetadata, p Preset, streamId int) []string {
	videoFilter := CalculateResizeFilter(v.Width, v.Height, p.Width, p.Height)
	if v.Framerate > 0 {
		log.Debug("Applying framerate to video filter")
		videoFilter = fmt.Sprintf("%s,fps=fps=%f", videoFilter, v.Framerate)
	}

	commands := []string{
		fmt.Sprintf("-c:v:%d", streamId), "libx264",
		fmt.Sprintf("-c:a:%d", streamId), "aac",
		fmt.Sprintf("-filter:v:%d", streamId),
		videoFilter,
		"-crf", "22",
		"-preset", "faster",
		"-bf", "2",
		"-coder", "1",
		"-sc_threshold", "0",
		"-profile:v", "high",
	}

	if v.Bitrate > 0 {
		maxrateKb := calcMaxBitrate(v.Width, p.Width, v.Bitrate)
		bufsize := int(float64(maxrateKb) * 1.5)
		commands = append(commands, "-maxrate")
		commands = append(commands, fmt.Sprintf("%dK", maxrateKb))
		commands = append(commands, "-bufsize")
		commands = append(commands, fmt.Sprintf("%dK", bufsize))
	}

	return commands
}

func round(num float64) int {
	return int(num + math.Copysign(0.5, num))
}

func toFixed(num float64, precision int) float64 {
	output := math.Pow(10, float64(precision))
	return float64(round(num*output)) / output
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
