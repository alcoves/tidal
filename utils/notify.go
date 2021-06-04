package utils

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"net/http"

	log "github.com/sirupsen/logrus"
)

// Notify marshals the input and sends it to an http server
func Notify(job *TranscodeJob) {
	log.Info("Dispatching webhook: ", job.WebhookURL)
	jsonValue, _ := json.Marshal(job)

	client := &http.Client{}
	req, err := http.NewRequest("PATCH", job.WebhookURL, bytes.NewBuffer(jsonValue))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "test")
	if err != nil {
		log.Fatal(err)
	}

	resp, err := client.Do(req)
	if err != nil {
		log.Fatal(err)
	}

	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Fatal(err)
	}

	log.Info("Webhook Reponse: ", string(body))
}
