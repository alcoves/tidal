package utils

import "github.com/minio/minio-go/v7"

// Video is a slim ffprobe struct
type Video struct {
	width     int
	height    int
	bitrate   int
	rotate    int
	framerate float64
	duration  float32
}

// S3Config is used for dynamic s3 profile switching
type S3Config struct {
	Endpoint        string
	AccessKeyID     string
	SecretAccessKey string
}

// ThumbnailInput is for GenerateThumbnail
type ThumbnailInput struct {
	Cmd         string
	S3In        string
	S3Out       string
	S3InClient  *minio.Client
	S3OutClient *minio.Client
}

// SourceObject is an s3 construct
type SourceObject struct {
	Bucket string
	Key    string
}
