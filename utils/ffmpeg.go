package utils

import (
	"bytes"
	"os/exec"

	log "github.com/sirupsen/logrus"
)

func Ffmpeg(args []string) string {
	cmd := exec.Command("ffmpeg", args...)
	var stdout bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	log.Debug(cmd.Args)
	cmd.Run()
	log.Debug(stderr.String())
	log.Debug(stdout.String())
	return stdout.String()
}
