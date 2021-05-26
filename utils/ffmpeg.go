package utils

import (
	"bytes"
	"os/exec"
)

func Ffmpeg(args []string) string {
	cmd := exec.Command("ffmpeg", args...)
	var stdout bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	cmd.Run()
	return stdout.String()
}
