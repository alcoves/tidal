package utils

// Preset is a struct containing transcoder commands
type Preset struct {
	Name    string `json:"name"`
	Command string `json:"command"`
}

// Response is what goes back to the caller
type Response struct {
	Presets []Preset `json:"presets"`
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

// Job is used to create a new video encoding job
// TODO :: Breakup request and response to prevent weird shit
type Job struct {
	ID                   string        `json:"id"`
	JobDir               string        `json:"jobDir"`
	Presets              []Preset      `json:"presets"`
	Metadata             VideoMetadata `json:"metadata"`
	SourceAudioPath      string        `json:"sourceAudioPath"`
	RcloneSourceURI      string        `json:"rcloneSourceUri"`
	RcloneDestinationURI string        `json:"rcloneDestinationUri"`
}

type SegmentationRequest struct {
	JobDir    string        `json:"JobDir"`
	Metadata  VideoMetadata `json:"metadata"`
	SourceURI string        `json:"sourceUri"`
}

type SegmentationResponse struct {
	TotalSegments     int    `json:"totalSegments"`
	SourceSegmentsDir string `json:"sourceSegmentsDir"`
}

type TranscodeSegmentsRequest struct {
	JobDir            string   `json:"JobDir"`
	Presets           []Preset `json:"presets"`
	SourceSegmentsDir string   `json:"sourceSegmentsDir"`
}

type TranscodeSegmentsResponse struct {
	TotalSegments     int    `json:"totalSegments"`
	SourceSegmentsDir string `json:"sourceSegmentsDir"`
}

type ConcatinatePresetsRequest struct {
	JobDir                string   `json:"jobDir"`
	Presets               []Preset `json:"presets"`
	SourceAudioPath       string   `json:"sourceAudioPath"`
	TranscodedSegmentsDir string   `json:"transcodedSegmentsDir"`
}

type PackageHLSRequest struct {
	JobDir string `json:"jobDir"`
}

type SplitSourceAudioRequest struct {
	JobDir    string `json:"jobDir"`
	SourceURI string `json:"sourceUri"`
}
