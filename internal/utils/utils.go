package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"os"
	"os/exec"
	"strconv"
	"strings"
)

// Preset is a struct containing transcoder commands
type Preset struct {
	Name string `json:"name"`
	Cmd  string `json:"cmd"`
}

// Presets is an array of presets
type Presets []Preset

// Response is what goes back to the caller
type Response struct {
	Presets []Preset `json:"presets"`
}

// GlobalVars are used to set sane application defaults
type GlobalVars struct {
	TidalPath        string `json="tidalPath"`
	TidalTmpPath     string `json="tidalTmpPath"`
	RcloneConfigPath string `json="rcloneConfigPath"`
}

// Video is a slim ffprobe struct
type Video struct {
	width     int
	height    int
	bitrate   int
	rotate    int
	framerate float64
	duration  float32
}

// CalculatePresets returns a json list of availible presets
func CalculatePresets(inputPath string) Presets {
	metadata := GetMetadata(inputPath)
	presets := GetPresets(metadata)

	response := Response{
		Presets: presets,
	}

	prettyResponse, err := json.Marshal(response)
	if err != nil {
		log.Println(err)
	}
	fmt.Println(string(prettyResponse))
	return presets
}

// Rclone executes an rclone subprocess given the inputs
func Rclone(subCommand string, arguments []string) string {
	config := Config()
	args := []string{}
	args = append(args, subCommand)

	for i := 0; i < len(arguments); i++ {
		args = append(args, arguments[i])
	}

	args = append(args, "--config")
	args = append(args, config.RcloneConfigPath)

	var out bytes.Buffer
	var stderr bytes.Buffer

	fmt.Println("Running rclone command", args)
	cmd := exec.Command("rclone", args...)
	cmd.Stdout = &out
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		log.Fatal(err)
	}

	output := out.String()
	return output
}

// Config contains the neccesary defaults for the application
func Config() GlobalVars {
	c := GlobalVars{
		TidalPath:        "/mnt/tidal",
		TidalTmpPath:     "/mnt/tidal/tmp",
		RcloneConfigPath: "/mnt/tidal/rclone.conf",
	}
	_, err := os.Stat(c.RcloneConfigPath)
	if os.IsNotExist(err) {
		log.Fatal(err)
	}
	fmt.Printf("Using rclone config %s\n", c.RcloneConfigPath)
	return c
}

// CalcScale returns an ffmpeg video filter
func CalcScale(w int, h int, dw int) string {
	videoRatio := float32(h) / float32(w)
	desiredHeight := int(videoRatio * float32(dw))

	// Video heights must be divisible by 2
	if desiredHeight%2 != 0 {
		desiredHeight++
	}

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
			Name: "360",
			Cmd:  x264(v, 640),
		},
	}

	if ClampPreset(v.width, v.height, 1280, 720) {
		addition := Preset{
			Name: "720",
			Cmd:  x264(v, 1280),
		}
		presets = append(presets, addition)
	}

	if ClampPreset(v.width, v.height, 1920, 1080) {
		addition := Preset{
			Name: "1080",
			Cmd:  x264(v, 1920),
		}
		presets = append(presets, addition)
	}

	if ClampPreset(v.width, v.height, 2560, 1440) {
		addition := Preset{
			Name: "1440",
			Cmd:  x264(v, 2560),
		}
		presets = append(presets, addition)
	}

	if ClampPreset(v.width, v.height, 3840, 2160) {
		addition := Preset{
			Name: "2160",
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
	scale := CalcScale(v.width, v.height, desiredWidth)
	vf := fmt.Sprintf("-vf fps=fps=%f,%s", v.framerate, scale)

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

func round(num float64) int {
	return int(num + math.Copysign(0.5, num))
}

func toFixed(num float64, precision int) float64 {
	output := math.Pow(10, float64(precision))
	return float64(round(num*output)) / output
}

// ParseFramerate converts an ffmpeg framerate string to a float32
func ParseFramerate(fr string) float64 {
	var parsedFramerate float64 = 0

	if strings.Contains(fr, "/") {
		slice := strings.Split(fr, "/")

		frameFrequency, err := strconv.ParseFloat(slice[0], 64)
		if err != nil {
			panic(err)
		}
		timeInterval, err := strconv.ParseFloat(slice[1], 64)
		if err != nil {
			panic(err)
		}

		parsedFramerate = toFixed(frameFrequency/timeInterval, 3)
	} else {
		fr, err := strconv.ParseFloat(fr, 64)
		if err != nil {
			panic(err)
		}
		parsedFramerate = fr
	}

	if parsedFramerate > 60 {
		return 60
	}
	return parsedFramerate
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
			metadata.framerate = ParseFramerate(value)
		}
	}

	return *metadata
}
