package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os/exec"
	"strconv"
	"strings"
)

// Video is a slim ffprobe struct
type Video struct {
	width     int
	height    int
	bitrate   int
	framerate string
	duration  float32
}

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

func calcMaxBitrate(originalWidth int, desiredWidth int, bitrate int) int {
	vidRatio := float32(desiredWidth) / float32(originalWidth)
	return int(vidRatio * float32(bitrate) / 1000)
}

func x264(v Video, desiredWidth int) string {
	vf := fmt.Sprintf("-vf fps=fps=%s,scale=%d:-2", v.framerate, desiredWidth)

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

func getPresets(v Video) Presets {
	presets := Presets{
		Preset{
			Name: "360p",
			Cmd:  x264(v, 640),
		},
	}

	if v.width >= 1280 {
		addition := Preset{
			Name: "720p",
			Cmd:  x264(v, 1280),
		}
		presets = append(presets, addition)
	}

	if v.width >= 1920 {
		addition := Preset{
			Name: "1080p",
			Cmd:  x264(v, 1920),
		}
		presets = append(presets, addition)
	}

	if v.width >= 2560 {
		addition := Preset{
			Name: "1440p",
			Cmd:  x264(v, 2560),
		}
		presets = append(presets, addition)
	}

	if v.width >= 3840 {
		addition := Preset{
			Name: "2160p",
			Cmd:  x264(v, 3840),
		}
		presets = append(presets, addition)
	}

	return presets
}

func getMetadata(url string) Video {
	ffprobeCmds := []string{
		"-v", "error",
		"-select_streams", "v:0",
		"-show_entries", "format=duration",
		"-of", "default=noprint_wrappers=1",
		"-show_entries", "stream=width,height,r_frame_rate,bit_rate",
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
		} else if key == "r_frame_rate" {
			metadata.framerate = value
		}
	}

	return *metadata
}

func main() {
	inputFlag := flag.String("input", "", "the path to the video")
	flag.Parse()

	metadata := getMetadata(*inputFlag)
	presets := getPresets(metadata)

	response := Response{
		Presets: presets,
	}

	prettyResponse, err := json.Marshal(response)
	if err != nil {
		log.Println(err)
	}
	fmt.Println(string(prettyResponse))
}
