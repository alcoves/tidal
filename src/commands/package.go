package commands

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"

	"github.com/minio/minio-go/v7"
)

// PackageEvent is used for a packaging event
type PackageEvent struct {
	VideoID     string
	PresetName  string
	S3In        string
	S3Out       string
	S3InClient  *minio.Client
	S3OutClient *minio.Client
}

// Package download all video segments for a given preset.
// Those presets are concatinated and stiched to source audio.
// HLS assets are generated and sent to the destination.
func Package(e PackageEvent) {
	fmt.Println("Setting up")

	fmt.Println("Creating temporary directory")
	tmpDir, err := ioutil.TempDir("/tmp", "")
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Downloading transcoded segments")

	fmt.Println("Creating concatination manifest")

	fmt.Println("Concatinating segments")

	fmt.Println("Removing segments")

	fmt.Println("Check for audio")
	fmt.Println("Download audio")
	fmt.Println("Stitch audio to video")
	fmt.Println("Remove video without audio")

	fmt.Println("Creating HLS assets")
	fmt.Println("Upload assets to the destination")
	fmt.Println("Aquire consul lock and begin packaging")

	fmt.Println("Removing temporary directory")
	err = os.RemoveAll(tmpDir)
	if err != nil {
		log.Fatal(err)
	}
}
