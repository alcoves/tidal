package utils

import (
	"encoding/json"
	"log"
	"os"
	"os/exec"
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

	out, err := cmd.CombinedOutput()
	if err != nil {
		log.Fatalf("cmd.Run() failed with %s\n", err)
	}
	return string(out)
}
