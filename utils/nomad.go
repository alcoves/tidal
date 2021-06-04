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
		log.Error("Nomad token is empty")
	}

	client, err := api.NewClient(api.DefaultConfig())
	if err != nil {
		log.Fatal(err)
	}

	jobs := client.Jobs()
	writeOps := api.WriteOptions{AuthToken: nomadToken}
	response, _, err := jobs.Dispatch("transcode", meta, nil, &writeOps)
	if err != nil {
		log.Error(err)
	}
	log.Info("Dispatch Response: ", response)
	// opts := api.QueryOptions{AuthToken: nomadToken}
}
