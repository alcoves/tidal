package routes

type Job struct {
	ID              string   `json:"id"`
	Metadata        Metadata `json:"metadata"`
	Presets         []Preset `json:"presets"`
	RcloneSourceURI string   `json:"rcloneSourceUri"`
}

type Metadata struct {
	Framerate float64 `json:"framerate"`
}

type Preset struct {
	ID      int    `json:"id"`
	Name    string `json:"name"`
	Command string `json:"command"`
}
