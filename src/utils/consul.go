package utils

import (
	"fmt"
	"os/exec"
)

func PutKV(key string, value string) string {
	args := []string{}
	args = append(args, "kv")
	args = append(args, "put")
	args = append(args, key)
	args = append(args, value)

	cmd := exec.Command("consul", args...)
	out, err := cmd.Output()
	if err != nil {
		fmt.Println("Error:", err)
		panic(err)
	}

	return string(out)
}
