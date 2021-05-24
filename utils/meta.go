package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
)

// TidalMetaRendition represents an individual video preset
type TidalMetaRendition struct {
	Type             string  `json:"type"`
	Name             string  `json:"name"`
	PercentCompleted float64 `json:"percentCompleted"`
}

// TidalMeta is a struct that contains relevant metadata about a video encode
type TidalMeta struct {
	ID                  string               `json:"id"`
	Status              string               `json:"status"`
	Duration            float64              `json:"duration"`
	Renditions          []TidalMetaRendition `json:"renditions"`
	Thumbnail           string               `json:"thumbnail"`
	HLSMasterLink       string               `json:"hlsMasterLink"`
	PercentCompleted    float64              `json:"percentCompleted"`
	SourceSegmentsCount int                  `json:"sourceSegmentsCount"`
}

// UpsertTidalMeta marshals the input and sends it to an http server
func UpsertTidalMeta(m *TidalMeta, endpoint string) {
	fmt.Println("Dispatching webhook", endpoint)
	jsonValue, _ := json.Marshal(m)

	client := &http.Client{}
	req, err := http.NewRequest("PATCH", endpoint, bytes.NewBuffer(jsonValue))
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
	fmt.Println("Webhook Reponse:", string(body))
}
