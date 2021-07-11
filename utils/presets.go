package utils

// GetPresets returns consumable presets
func GetPresets(v VideoMetadata) []Preset {
	presets := []Preset{
		{
			Name:           "360",
			Width:          640,
			Height:         360,
			DefaultMaxRate: 1500,
		},
	}

	if ClampPreset(v.Width, v.Height, 1280, 720) {
		addition := Preset{
			Name:           "720",
			Width:          1280,
			Height:         720,
			DefaultMaxRate: 8000,
		}
		presets = append(presets, addition)
	}

	if ClampPreset(v.Width, v.Height, 1920, 1080) {
		addition := Preset{
			Name:           "1080",
			Width:          1920,
			Height:         1080,
			DefaultMaxRate: 12000,
		}
		presets = append(presets, addition)
	}

	if ClampPreset(v.Width, v.Height, 2560, 1440) {
		addition := Preset{
			Name:           "1440",
			Width:          2560,
			Height:         1440,
			DefaultMaxRate: 24000,
		}
		presets = append(presets, addition)
	}

	if ClampPreset(v.Width, v.Height, 3840, 2160) {
		addition := Preset{
			Name:           "2160",
			Width:          3840,
			Height:         2160,
			DefaultMaxRate: 50000,
		}
		presets = append(presets, addition)
	}

	return presets
}
