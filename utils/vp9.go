package utils

import (
	"fmt"

	log "github.com/sirupsen/logrus"
)

func VP9(v VideoMetadata, p Preset, streamId int) []string {
	videoFilter := CalculateResizeFilter(p.Width)
	if v.Framerate > 0 {
		log.Debug("Applying framerate to video filter")
		videoFilter = fmt.Sprintf("%s,fps=fps=%f", videoFilter, v.Framerate)
	}

	commands := []string{
		fmt.Sprintf("-c:v:%d", streamId), "libvpx-vp9",
		fmt.Sprintf("-c:a:%d", streamId), "libopus",
		fmt.Sprintf("-filter:v:%d", streamId),
		videoFilter,
		"-crf", "38",
		"-speed", "1",
		"-row-mt", "1",
	}

	return commands
}
