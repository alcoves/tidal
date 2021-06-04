package utils

import (
	"bytes"
	"os"
	"os/exec"
	"strings"

	log "github.com/sirupsen/logrus"
)

func RcloneCmd(args []string) string {
	cmd := exec.Command("rclone", args...)
	log.Debug(cmd.Args)
	cmd.Env = os.Environ()

	var stdout bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()
	if err != nil {
		log.Fatal(stderr.String())
	}

	output := stdout.String()
	return strings.Replace(output, "\n", "", -1)
}
