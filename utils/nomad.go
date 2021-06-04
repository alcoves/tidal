package utils

import (
	"os"

	"github.com/hashicorp/nomad/api"
	log "github.com/sirupsen/logrus"
)

// Dispatch enqueues a batch job to Nomad
func Dispatch(jobName string, meta map[string]string) {
	nomadToken := os.Getenv("NOMAD_TOKEN")
	if nomadToken == "" {
		log.Error("Consul token is empty")
	}

	client, err := api.NewClient(api.DefaultConfig())
	if err != nil {
		log.Fatal(err)
	}

	jobs := client.Jobs()
	jobs.Dispatch("transcode", meta, nil, nil)
	// opts := api.QueryOptions{AuthToken: nomadToken}
}
