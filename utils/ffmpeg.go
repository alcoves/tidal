package utils

import (
	"bytes"
	"os/exec"
	"strings"

	log "github.com/sirupsen/logrus"
)

func Ffmpeg(args []string) string {
	joined := strings.Join(args, " ")
	// FIXME :: For some reason ffmpeg only works when the command is wrapped by bash
	// cmd := exec.Command("ffmpeg", args...)
	cmd := exec.Command("/bin/bash", "-c", joined)
	var stdout bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	log.Debug("FFMPEG ARGUMENTS", cmd.Args)
	cmd.Run()
	log.Debug(stderr.String())
	log.Debug(stdout.String())
	return stdout.String()
}
