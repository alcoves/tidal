package utils

import (
	"encoding/json"
	"io/ioutil"
	"os"
)

type Version struct {
	Name     string `json="name"`
	Segments int    `json="segments"`
}

type TidalConfig struct {
	InPath   string `json="inPath"`
	OutPath  string `json="outPath"`
	Segments int    `json="segments"`
	Versions []Version
}

func WriteTidalConfig(e TidalConfig) {
	file, _ := json.MarshalIndent(e, "", " ")
	_ = ioutil.WriteFile("tidal.config", file, os.ModePerm)
}

func GetTidalConfig(path string) {
	// Implement
}

func UpdateTidalConfig(e TidalConfig) {
	// var fileMutex sync.Mutex
	// fileMutex.Lock()
	// defer fileMutex.Unlock()
}
