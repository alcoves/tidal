package utils

import (
	"io/ioutil"
	"log"
	"os"
	"strings"
)

func TranscodeSegments(req TranscodeSegmentsRequest) TranscodeSegmentsResponse {
	segments, err := ioutil.ReadDir(req.SourceSegmentsDir)
	if err != nil {
		log.Fatal(err)
	}

	for i := 0; i < len(req.Presets); i++ {
		preset := req.Presets[i]
		for _, f := range segments {
			outDir := req.JobDir + "/transcoded-segments/" + preset.Name
			os.MkdirAll(outDir, os.ModePerm)

			outPath := outDir + "/" + f.Name()
			presetCommands := strings.Split(preset.Command, " ")

			commands := []string{
				"-hide_banner", "-y",
				"-i", req.SourceSegmentsDir + "/" + f.Name(),
			}

			for i := 0; i < len(presetCommands); i++ {
				commands = append(commands, presetCommands[i])
			}

			commands = append(commands, outPath)
			Ffmpeg(commands)
		}
	}

	return TranscodeSegmentsResponse{}
}
