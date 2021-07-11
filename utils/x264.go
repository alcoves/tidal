package utils

import (
	"fmt"

	log "github.com/sirupsen/logrus"
)

func X264(v VideoMetadata, p Preset, streamId int) []string {
	videoFilter := CalculateResizeFilter(p.Width)
	if v.Framerate > 0 {
		log.Debug("Applying framerate to video filter")
		videoFilter = fmt.Sprintf("%s,fps=fps=%f", videoFilter, v.Framerate)
	}

	commands := []string{
		"-map", "0:v:0",
		fmt.Sprintf("-c:v:%d", streamId), "libx264",
		fmt.Sprintf("-filter:v:%d", streamId),
		videoFilter,
		"-crf", "22",
		"-preset", "medium",
		"-bf", "2",
		"-coder", "1",
		"-profile:v", "high",
	}

	if v.Bitrate > 0 {
		maxrateKb := CalcMaxBitrate(v.Width, p.Width, v.Bitrate)
		bufsize := int(float64(maxrateKb) * 1.5)
		commands = append(commands, "-maxrate")
		commands = append(commands, fmt.Sprintf("%dK", maxrateKb))
		commands = append(commands, "-bufsize")
		commands = append(commands, fmt.Sprintf("%dK", bufsize))
	} else {
		bufsize := int(float64(p.DefaultMaxRate) * 1.5)
		fmt.Println("DefaultMaxRate", p.DefaultMaxRate)
		commands = append(commands, "-maxrate")
		commands = append(commands, fmt.Sprintf("%dK", p.DefaultMaxRate))
		commands = append(commands, "-bufsize")
		commands = append(commands, fmt.Sprintf("%dK", bufsize))
	}

	return commands
}
