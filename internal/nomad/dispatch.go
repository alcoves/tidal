package nomad

import (
	"fmt"
	"os"
	"os/exec"
)

// Dispatch enqueues a batch job to Nomad
// TODO :: This function should use the Nomad HTTP API
func Dispatch(jobName string, meta []string, nomadToken string) {
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
	cmd.Env = os.Environ()
	cmd.Env = append(cmd.Env, fmt.Sprintf("NOMAD_TOKEN=%s", nomadToken))

	fmt.Println("Nomad args", cmd.Args)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		fmt.Println("Error:", err)
		panic(err)
	}
}
