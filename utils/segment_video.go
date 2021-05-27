package utils

import (
	"fmt"
	"io/ioutil"
	"os"

	log "github.com/sirupsen/logrus"
)

// SegmentVideo splits a video file into smaller segments
func SegmentVideo(segReq SegmentationRequest) SegmentationResponse {
	log.Debug("SegmentVideo")
	sourceSegmentsDir := fmt.Sprintf("%s/%s", segReq.JobDir, "source-segments")
	os.MkdirAll(sourceSegmentsDir, os.ModePerm)

	segmentTime := "120"
	if segReq.Metadata.Duration < 3600 {
		segmentTime = "60"
	} else if segReq.Metadata.Duration < 1800 {
		segmentTime = "30"
	} else if segReq.Metadata.Duration < 900 {
		segmentTime = "20"
	} else if segReq.Metadata.Duration < 300 {
		segmentTime = "10"
	}

	Ffmpeg([]string{
		"-hide_banner", "-y",
		"-i", segReq.SourceURI,
		"-f", "segment",
		"-c", "copy",
		"-an",
		"-segment_time", segmentTime,
		sourceSegmentsDir + `/%08d` + ".ts",
	})

	segments, err := ioutil.ReadDir(sourceSegmentsDir)
	if err != nil {
		log.Fatal("failed to read segments directory")
	}

	response := SegmentationResponse{
		TotalSegments:     len(segments),
		SourceSegmentsDir: sourceSegmentsDir,
	}
	log.Debug("SegmentVideo", response)
	return response
}
