package utils

// Preset is a struct containing transcoder commands
type Preset struct {
	Name   string `json:"name"`
	Width  int    `json:"width"`
	Height int    `json:"height"`
}

// VideoMetadata is a slim ffprobe struct
type VideoMetadata struct {
	Width     int     `json:"width"`
	Height    int     `json:"height"`
	Bitrate   int     `json:"bitrate"`
	Rotate    int     `json:"rotate"` // TODO :: Deprecate
	Framerate float64 `json:"framerate"`
	Duration  float64 `json:"duration"`
	HasAudio  bool    `json:"hasAudio"` // TODO :: Deprecate
}

// VideoJob handles the variables for a video transcode
type VideoJob struct {
	JobDir               string        `json:"jobDir"`
	VideoID              string        `json:"videoId"`
	Presets              []Preset      `json:"presets"`
	Metadata             VideoMetadata `json:"metadata"`
	SignedURL            string        `json:"signedUrl"`
	WebhookURL           string        `json:"webhookURL"`
	RcloneSourceURI      string        `json:"rcloneSourceURI"`
	RcloneDestinationURI string        `json:"rcloneDestinationURI"`
}
