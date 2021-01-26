package commands

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/bken-io/tidal/src/utils"
)

// CalculatePresets returns a json list of availible presets
func CalculatePresets(inputPath string) {
	metadata := utils.GetMetadata(inputPath)
	presets := utils.GetPresets(metadata)

	response := utils.Response{
		Presets: presets,
	}

	prettyResponse, err := json.Marshal(response)
	if err != nil {
		log.Println(err)
	}
	fmt.Println(string(prettyResponse))
}
