package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"

	"github.com/bken-io/tidal/src/utils"
)

func main() {
	inputFlag := flag.String("input", "", "the path to the video")
	flag.Parse()

	metadata := utils.GetMetadata(*inputFlag)
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
