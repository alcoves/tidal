package utils

import (
	"fmt"
	"os/exec"
)

// DispatchNomadJob enqueues a batch job to Nomad
func DispatchNomadJob(jobName string, meta []string) string {
	args := []string{}
	args = append(args, "job")
	args = append(args, "dispatch")
	args = append(args, "-detach")

	for i := 0; i < len(meta); i++ {
		m := meta[i]
		args = append(args, "-meta")
		args = append(args, m)
	}

	args = append(args, jobName)
	cmd := exec.Command("nomad", args...)
	out, err := cmd.Output()
	if err != nil {
		fmt.Println("Error:", err)
		panic(err)
	}

	return string(out)
}
