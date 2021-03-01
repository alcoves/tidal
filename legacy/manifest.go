package commands

import (
	"bufio"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"sort"
	"strconv"
	"strings"

	"github.com/bkenio/tidal/src/utils"
	"github.com/minio/minio-go/v7"
)

type CreateMasterPlaylist struct {
	PresetName               string
	VideoID                  string
	S3Bucket                 string
	S3Client                 *minio.Client
	RemoteMasterPlaylistPath string
}

func GenerateHLSMasterBento4(e CreateMasterPlaylist) {
	fmt.Println("Creating the master playlist")

	fmt.Println("Creating consul lock")
	lockKey := fmt.Sprintf("tidal/%s-master.m3u8", e.VideoID)
	lock, err := utils.NewLock(lockKey)
	if err != nil {
		fmt.Println("Unable to create consul lock:", err.Error())
		log.Fatal(err)
	}
	if err := lock.Lock(); err != nil {
		fmt.Println("Error while trying to acquire lock:", err.Error())
		log.Fatal(err)
	}
	defer lock.Unlock()

	fmt.Println("Create temporary directory")
	tmpDir, err := ioutil.TempDir("/tmp", "tidal-master-")
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("List manifest files")
	// TODO :: too many assumptions being made here
	objects := utils.ListObjects(e.S3Client, e.S3Bucket, fmt.Sprintf("v/%s/hls", e.VideoID))

	for i := 0; i < len(objects); i++ {
		object := objects[i]
		if strings.Contains(object.Key, "/preset-master.m3u8") {
			fmt.Println("Download remote preset", object.Key)
			presetTmpDir, err := ioutil.TempDir("/tmp", "tidal-preset-master")
			if err != nil {
				log.Fatal(err)
			}

			outPath := utils.GetObject(e.S3Client, e.S3Bucket, object.Key, presetTmpDir)
			presetName := strings.Split(object.Key, "/")[3] // TODO :: assumptions being made

			renamedOutPath := fmt.Sprintf("%s/%s.m3u8", tmpDir, presetName)
			fmt.Println("Moving preset file", outPath, renamedOutPath)
			err = os.Rename(outPath, renamedOutPath)
			if err != nil {
				log.Fatal(err)
			}

			fmt.Println("Remove temporary preset directory")
			err = os.RemoveAll(presetTmpDir)
			if err != nil {
				log.Fatal(err)
			}
		}
	}

	fmt.Println("Create master manifest")
	masterPlaylistPath := fmt.Sprintf("%s/master.m3u8", tmpDir)
	playlists, err := ioutil.ReadDir(tmpDir)
	if err != nil {
		log.Fatal(err)
	}

	sort.Slice(playlists, func(i, j int) bool {
		playList1, err := strconv.Atoi(strings.Split(playlists[i].Name(), ".")[0])
		playList2, err := strconv.Atoi(strings.Split(playlists[j].Name(), ".")[0])
		if err != nil {
			log.Fatal("Failed to cast string to int")
		}

		if playList1 == 720 {
			return true
		}

		return playList1 < playList2
	})

	for i := 0; i < len(playlists); i++ {
		playlist := playlists[i]
		presetName := strings.Split(playlist.Name(), ".m3u8")[0]

		fmt.Println("Processing preset", presetName)
		inPath := fmt.Sprintf("%s/%s", tmpDir, playlist.Name())

		file, err := os.Open(inPath)
		if err != nil {
			log.Fatal(err)
		}
		defer file.Close()

		if i == 0 {
			// If the file doesn't exist, create it, or append to the file
			f, err := os.OpenFile(masterPlaylistPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
			if err != nil {
				log.Fatal(err)
			}
			f.Write([]byte("#EXTM3U\n#EXT-X-VERSION:4\n"))
			if err := f.Close(); err != nil {
				log.Fatal(err)
			}
		}

		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			line := scanner.Text()
			playlistAppend := ""

			if strings.Contains(line, "#EXT-X-STREAM-INF:") {
				fmt.Println("Adding a #EXT-X-STREAM-INF stream to master.m3u8")
				playlistAppend = fmt.Sprintf("%s\n%s/media-1/stream.m3u8\n", line, presetName)
			}

			if strings.Contains(line, "#EXT-X-I-FRAME-STREAM-INF:") {
				fmt.Println("Adding a #EXT-X-I-FRAME-STREAM-INF stream to master.m3u8")
				uriReplacement := fmt.Sprintf(`URI="%s/media-1/iframes.m3u8"`, presetName)
				replacedIFrameStream := strings.Replace(line, `URI="media-1/iframes.m3u8"`, uriReplacement, 1)
				playlistAppend = replacedIFrameStream + "\n"
			}

			if playlistAppend != "" {
				// If the file doesn't exist, create it, or append to the file
				f, err := os.OpenFile(masterPlaylistPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
				if err != nil {
					log.Fatal(err)
				}
				if _, err := f.Write([]byte(playlistAppend)); err != nil {
					log.Fatal(err)
				}
				if err := f.Close(); err != nil {
					log.Fatal(err)
				}
			}
		}

		if err := scanner.Err(); err != nil {
			log.Fatal(err)
		}
	}

	fmt.Println("Upload manifest")
	utils.PutObject(e.S3Client, e.S3Bucket, e.RemoteMasterPlaylistPath, masterPlaylistPath)

	fmt.Println("Remove temporary directory")
	err = os.RemoveAll(tmpDir)
	if err != nil {
		log.Fatal(err)
	}
}
