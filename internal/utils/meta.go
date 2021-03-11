package utils

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
)

// TidalMeta is a struct that contains relevant metadata about a video encode
type TidalMeta struct {
	Status           string  `json:"status"`
	Duration         int     `json:"duration"`
	PercentCompleted float32 `json:"percentCompleted"`
}

// UpsertTidalMeta marshals the input and copyies it to the remote
func UpsertTidalMeta(m TidalMeta, rcloneDest string) {
	remoteMetaPath := fmt.Sprintf("%s/meta.json", rcloneDest)

	fmt.Println("Create temporary meta file")
	tmpTidalMetaFile, err := ioutil.TempFile(Config.TidalTmpDir, "tidal-meta-")
	if err != nil {
		log.Fatal(err)
	}
	defer os.Remove(tmpTidalMetaFile.Name())

	file, err := json.MarshalIndent(m, "", " ")
	if err != nil {
		log.Fatal(err)
	}
	_ = ioutil.WriteFile(tmpTidalMetaFile.Name(), file, os.ModePerm)

	fmt.Println("Creating tidal meta file in remote")
	Rclone("copyto", []string{tmpTidalMetaFile.Name(), remoteMetaPath}, Config.RcloneConfig)
}
