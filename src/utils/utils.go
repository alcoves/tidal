package utils

import (
	"bytes"
	"fmt"
	"log"
	"os/exec"
	"strconv"
	"strings"
)

// CalcScale returns an ffmpeg video filter
func CalcScale(w int, h int, dw int, rot int) string {
	var videoRatio float32

	if rot == 90 || rot == 270 {
		videoRatio = float32(w) / float32(h)
	} else {
		videoRatio = float32(h) / float32(w)
	}

	desiredHeight := int(videoRatio * float32(dw))
	return fmt.Sprintf("scale=%d:%d", dw, desiredHeight)
}

// ClampPreset checks if the video fits the specified dimensions
func ClampPreset(w int, h int, dw int, dh int) bool {
	if (w >= dw && h >= dh) || (w >= dh && h >= dw) {
		return true
	}
	return false
}

// GetPresets returns consumable presets
func GetPresets(v Video) Presets {
	presets := Presets{
		Preset{
			Name: "360p",
			Cmd:  x264(v, 640),
		},
	}

	if ClampPreset(v.width, v.height, 1280, 720) {
		addition := Preset{
			Name: "720p",
			Cmd:  x264(v, 1280),
		}
		presets = append(presets, addition)
	}

	if ClampPreset(v.width, v.height, 1920, 1080) {
		addition := Preset{
			Name: "1080p",
			Cmd:  x264(v, 1920),
		}
		presets = append(presets, addition)
	}

	if ClampPreset(v.width, v.height, 2560, 1440) {
		addition := Preset{
			Name: "1440p",
			Cmd:  x264(v, 2560),
		}
		presets = append(presets, addition)
	}

	if ClampPreset(v.width, v.height, 3840, 2160) {
		addition := Preset{
			Name: "2160p",
			Cmd:  x264(v, 3840),
		}
		presets = append(presets, addition)
	}

	return presets
}

func calcMaxBitrate(originalWidth int, desiredWidth int, bitrate int) int {
	vidRatio := float32(desiredWidth) / float32(originalWidth)
	return int(vidRatio * float32(bitrate) / 1000)
}

func x264(v Video, desiredWidth int) string {
	scale := CalcScale(v.width, v.height, desiredWidth, v.rotate)
	vf := fmt.Sprintf("-vf fps=fps=%s,%s", v.framerate, scale)

	commands := []string{
		vf,
		"-bf 2",
		"-crf 22",
		"-coder 1",
		"-c:v libx264",
		"-preset faster",
		"-sc_threshold 0",
		"-profile:v high",
		"-pix_fmt yuv420p",
		"-force_key_frames expr:gte(t,n_forced*2)",
	}

	if v.bitrate > 0 {
		maxrateKb := calcMaxBitrate(v.width, desiredWidth, v.bitrate)
		bufsize := int(float32(maxrateKb) * 1.5)
		maxrateCommand := fmt.Sprintf("-maxrate %dK -bufsize %dK", maxrateKb, bufsize)
		commands = append(commands, maxrateCommand)
	}

	return strings.Join(commands, " ")
}

// GetMetadata uses ffprobe to return video metadata
func GetMetadata(url string) Video {
	ffprobeCmds := []string{
		"-v", "error",
		"-select_streams", "v:0",
		"-show_entries", "format=duration",
		"-of", "default=noprint_wrappers=1",
		"-show_entries", "stream=width,height,r_frame_rate,bit_rate",
		"-show_entries", "stream_tags=rotate", // Shows rotation as TAG:rotate=90
		url,
	}

	cmd := exec.Command("ffprobe", ffprobeCmds...)
	var out bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &stderr
	err := cmd.Run()

	if err != nil {
		log.Fatal(fmt.Sprint(err) + ": " + stderr.String())
	}

	output := out.String()
	metadataSplit := strings.Split(output, "\n")
	metadata := new(Video)

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
			metadata.duration = float32(duration)
		} else if key == "width" {
			width, err := strconv.Atoi(value)
			if err != nil {
				log.Panic(err)
			}
			metadata.width = int(width)
		} else if key == "height" {
			height, err := strconv.Atoi(value)
			if err != nil {
				log.Panic(err)
			}
			metadata.height = int(height)
		} else if key == "bit_rate" {
			bitrate, err := strconv.Atoi(value)
			if err != nil {
				log.Panic(err)
			}
			metadata.bitrate = int(bitrate)
		} else if key == "TAG:rotate" {
			rotate, err := strconv.Atoi(value)
			if err != nil {
				log.Panic(err)
			}
			metadata.rotate = rotate
		} else if key == "r_frame_rate" {
			metadata.framerate = value
		}
	}

	return *metadata
}
