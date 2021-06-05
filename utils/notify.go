package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	log "github.com/sirupsen/logrus"
)

// Notify marshals the input and sends it to an http server
func Notify(webhookUrl string, updates map[string]interface{}) {
	jsonValue, _ := json.Marshal(updates)
	log.Info("Dispatching webhook: ", webhookUrl)
	fmt.Printf("WebHook Payload: \n%v\n", string(jsonValue))

	client := &http.Client{}
	req, err := http.NewRequest("PATCH", webhookUrl, bytes.NewBuffer(jsonValue))
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
	// body, err := ioutil.ReadAll(resp.Body)
	// if err != nil {
	// 	log.Fatal(err)
	// }

	log.Info("Webhook Reponse Code: ", resp.StatusCode)
}
