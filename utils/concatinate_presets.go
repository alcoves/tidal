package utils

import (
	"fmt"
	"io/ioutil"
	"os"

	log "github.com/sirupsen/logrus"
)

func createManifest(segmentDir string, manifestPath string) {
	transcodedSegments, err := ioutil.ReadDir(segmentDir)
	if err != nil {
		log.Fatal(err)
	}

	for i := 0; i < len(transcodedSegments); i++ {
		seg := transcodedSegments[i]
		concatAppend := fmt.Sprintf("file '%s/%s'\n", segmentDir, seg.Name())
		// If the file doesn't exist, create it, or append to the file
		f, err := os.OpenFile(manifestPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
		if err != nil {
			log.Fatal(err)
		}
		if _, err := f.Write([]byte(concatAppend)); err != nil {
			log.Fatal(err)
		}
		if err := f.Close(); err != nil {
			log.Fatal(err)
		}
	}
}

func ConcatinatePresets(request ConcatinatePresetsRequest) {
	log.Debug("ConcatinatePresets")
	manifestsDir := request.JobDir + "/manifests"
	os.MkdirAll(manifestsDir, os.ModePerm)

	for i := 0; i < len(request.Presets); i++ {
		preset := request.Presets[i]
		log.Debug("Concatinate Preset", preset.Name)
		manifestPath := manifestsDir + "/" + preset.Name + ".txt"
		segmentDir := request.JobDir + "/transcoded-segments/" + preset.Name

		outDir := request.JobDir + "/concatinated"
		os.MkdirAll(outDir, os.ModePerm)
		outPath := outDir + "/" + preset.Name + ".mp4"

		log.Debug("Creating manifest")
		createManifest(segmentDir, manifestPath)

		log.Debug("Concatinating segments")
		Ffmpeg([]string{
			"-hide_banner", "-y",
			"-safe", "0",
			"-f", "concat",
			"-i", manifestPath,
			"-c", "copy",
			outPath,
		})

		if request.SourceAudioPath != "" {
			log.Debug("Muxing audio")
			outPathTmp := outPath + ".tmp.mp4"
			Ffmpeg([]string{
				"-hide_banner", "-y",
				"-i", outPath,
				"-i", request.SourceAudioPath,
				"-c:v", "copy",
				outPathTmp,
			})
			err := os.Rename(outPathTmp, outPath)
			if err != nil {
				log.Fatal(err)
			}
		}

		// log.Debug("Combining source audio")
		// ffmpeg([]string{})
	}
}
