package utils

// Video is a slim ffprobe struct
type Video struct {
	width     int
	height    int
	bitrate   int
	rotate    int
	framerate float64
	duration  float32
}

// Preset is a struct containing transcoder commands
type Preset struct {
	Name string `json:"name"`
	Cmd  string `json:"cmd"`
}

// Presets is an array of presets
type Presets []Preset

// Response is what goes back to the caller
type Response struct {
	Presets []Preset `json:"presets"`
}
