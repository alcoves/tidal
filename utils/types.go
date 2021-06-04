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
	Rotate    int     `json:"rotate"`
	Framerate float64 `json:"framerate"`
	Duration  float64 `json:"duration"`
	HasAudio  bool    `json:"hasAudio"`
}

// Config is a global tidal configuration
type Config struct {
	TidalDir   string   `json:"tidalDir"`
	RcloneEnvs []string `json:"rcloneEnvs"`
}
