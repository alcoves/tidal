package utils

import (
	"context"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"

	"github.com/gabriel-vasile/mimetype"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

// CreateClient constructs and s3 client given required params
func CreateClient(c S3Config) *minio.Client {
	client, err := minio.New(c.Endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(c.AccessKeyID, c.SecretAccessKey, ""),
		Secure: true,
	})
	if err != nil {
		fmt.Println(err)
	}
	return client
}

// GetObject fetches an object from s3 and writes it to disk
func GetObject(
	s3Client *minio.Client,
	bucket string,
	key string,
	outDir string) string {

	filename := filepath.Base(key)
	outPath := fmt.Sprintf("%s/%s", outDir, filename)
	fmt.Println("Downloading", key, "to", outPath)

	object, err := s3Client.GetObject(
		context.Background(),
		bucket,
		key, minio.GetObjectOptions{})
	if err != nil {
		fmt.Println(err)
		return ""
	}
	localFile, err := os.Create(outPath)
	if err != nil {
		fmt.Println(err)
		return ""
	}
	if _, err = io.Copy(localFile, object); err != nil {
		fmt.Println(err)
	}

	return outPath
}

// Sync copies local files into an s3 bucket
// It's not very fast right now
// FIXME :: Only works one directory deep
func Sync(s3Client *minio.Client, inDir string, bucket string, key string) {
	files, err := ioutil.ReadDir(inDir)
	if err != nil {
		log.Fatal(err)
	}
	for _, f := range files {
		fmt.Println(f.Name())
		filePath := fmt.Sprintf("%s/%s", inDir, f.Name())
		file, err := os.Open(filePath)
		if err != nil {
			fmt.Println(err)
			return
		}
		defer file.Close()

		fileStat, err := file.Stat()
		if err != nil {
			fmt.Println(err)
			return
		}

		fileUploadKey := fmt.Sprintf("%s/%s", key, f.Name())

		mime, err := mimetype.DetectFile(filePath)
		if err != nil {
			fmt.Println("Error:", err)
			return
		}

		uploadInfo, err := s3Client.PutObject(
			context.Background(),
			bucket,
			fileUploadKey,
			file,
			fileStat.Size(),
			minio.PutObjectOptions{ContentType: mime.String()})
		if err != nil {
			fmt.Println(err)
			return
		}
		fmt.Println("Successfully uploaded bytes: ", uploadInfo)
	}
}

// PutObject Uploads an object given input parameters
func PutObject(s3Client *minio.Client, bucket string, key string, path string) {
	file, err := os.Open(path)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	defer file.Close()

	fileStat, err := file.Stat()
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	mime, err := mimetype.DetectFile(path)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	uploadInfo, err := s3Client.PutObject(
		context.Background(),
		bucket,
		key,
		file,
		fileStat.Size(),
		minio.PutObjectOptions{ContentType: mime.String()})
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	fmt.Println("Successfully uploaded bytes: ", uploadInfo)
}

// ListObjects returns an exhasutive list of objects
func ListObjects(s3Client *minio.Client, bucket string, prefix string) []minio.ObjectInfo {
	objects := []minio.ObjectInfo{}
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	objectCh := s3Client.ListObjects(ctx, bucket, minio.ListObjectsOptions{
		Prefix:    prefix,
		Recursive: true,
	})
	for object := range objectCh {
		if object.Err != nil {
			fmt.Println(object.Err)
			panic(object.Err)
		}
		// TODO :: Use channels instead
		objects = append(objects, object)
	}

	return objects
}
