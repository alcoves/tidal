package utils

import (
	"bytes"
	"encoding/json"
	"log"
	"os"
	"os/exec"
	"strings"
)

func RcloneCmd(args []string) string {
	kvGet, err := GetKv("config")
	if err != nil {
		log.Fatalln("failed to fetch config")
	}
	config := Config{}
	json.Unmarshal([]byte(kvGet.Value), &config)

	cmd := exec.Command("rclone", args...)
	cmd.Env = os.Environ()
	cmd.Env = append(cmd.Env, config.RcloneEnvs...)

	var stdout bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err = cmd.Run()
	if err != nil {
		log.Fatal(stderr.String())
	}

	output := stdout.String()
	return strings.Replace(output, "\n", "", -1)
}
