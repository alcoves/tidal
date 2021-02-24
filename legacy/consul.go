package utils

import (
	"fmt"
	"os"
	"os/exec"
)

// PutKV stores a value in the consul kv db
func PutKV(key string, value string) {
	args := []string{}
	args = append(args, "kv")
	args = append(args, "put")
	args = append(args, key)
	args = append(args, value)

	cmd := exec.Command("consul", args...)
	fmt.Println("Consul Args", cmd.Args)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		fmt.Println("Error:", err)
		panic(err)
	}
}
