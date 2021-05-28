package utils

import (
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"

	log "github.com/sirupsen/logrus"
)

func PackageHLS(request PackageHLSRequest) {
	log.Debug("Starting packaging")

	log.Debug("Creating HLS directory")
	hlsDir := fmt.Sprintf("%s/hls", request.JobDir)
	os.Mkdir(hlsDir, os.ModePerm)

	log.Debug("Reading in video files")
	concatinatedDir := request.JobDir + "/concatinated"
	concatinatedVideos, _ := ioutil.ReadDir(concatinatedDir)

	args := []string{}
	args = append(args, "--segment-duration")
	args = append(args, "6")
	args = append(args, "-f")
	args = append(args, "-o")
	args = append(args, hlsDir)

	for i := 0; i < len(concatinatedVideos); i++ {
		file := concatinatedVideos[i]
		args = append(args, concatinatedDir+"/"+file.Name())
	}

	cmd := exec.Command("mp4hls", args...)
	log.Debug("mp4hls", cmd.Args)
	if err := cmd.Run(); err != nil {
		log.Panic(err)
	}
}
