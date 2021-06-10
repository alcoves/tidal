package utils

import (
	"fmt"
	"reflect"
	"strings"
	"testing"
)

func TestParseFramerate(t *testing.T) {
	tests := []struct {
		framerate string
		expected  float64
	}{
		{"23.976", 23.976},
		{"24", 24},
		{"29.97", 29.97},
		{"30", 30},
		{"59.94", 59.94},
		{"60", 60},
		{"90", 60},
		{"120", 60},
		{"60/1", 60},
		{"24000/1001", 23.976000},
		{"90000/1", 60},
		{"2997/100", 29.97},
	}

	for _, test := range tests {
		testname := fmt.Sprintf("framerate %s parsed to %f", test.framerate, test.expected)
		t.Run(testname, func(t *testing.T) {
			recieved := ParseFramerate(test.framerate)
			if recieved != test.expected {
				t.Errorf("expected %f, recieved %f", test.expected, recieved)
			}
		})
	}
}

func TestCalcScale(t *testing.T) {
	tests := []struct {
		vw, vh, pw, ph int
		expected       string
	}{
		{3440, 2160, 640, 360, "scale=640:640:force_original_aspect_ratio=decrease"},
		{3440, 2160, 1280, 720, "scale=1280:1280:force_original_aspect_ratio=decrease"},
		{3440, 2160, 1920, 1080, "scale=1920:1920:force_original_aspect_ratio=decrease"},
		{3440, 2160, 2560, 1440, "scale=2560:2560:force_original_aspect_ratio=decrease"},
		{3440, 2160, 3440, 2160, "scale=3440:3440:force_original_aspect_ratio=decrease"},

		{1920, 1080, 640, 360, "scale=640:640:force_original_aspect_ratio=decrease"},
		{1920, 1080, 1280, 720, "scale=1280:1280:force_original_aspect_ratio=decrease"},
		{1920, 1080, 1920, 1080, "scale=1920:1920:force_original_aspect_ratio=decrease"},

		{1080, 1920, 640, 360, "scale=640:640:force_original_aspect_ratio=decrease"},
		{1080, 1920, 1280, 720, "scale=1280:1280:force_original_aspect_ratio=decrease"},
		{1080, 1920, 1920, 1080, "scale=1920:1920:force_original_aspect_ratio=decrease"},
	}

	for _, test := range tests {
		testname := fmt.Sprintf("%dx%d video has scale filter %s", test.vw, test.vh, test.expected)
		t.Run(testname, func(t *testing.T) {
			recieved := CalculateResizeFilter(test.pw)
			if recieved != test.expected {
				t.Errorf("expected %s, recieved %s", test.expected, recieved)
			}
		})
	}
}

func TestX264(t *testing.T) {
	tests := []struct {
		v        VideoMetadata
		p        Preset
		streamId int
		expected string
	}{
		{
			VideoMetadata{Width: 1920, Height: 1080}, Preset{Width: 1920, Height: 1080}, 0,
			"-c:v:0 libx264 -c:a:0 aac -filter:v:0 scale=1920:1920:force_original_aspect_ratio=decrease -crf 22 -preset faster -bf 2 -coder 1 -sc_threshold 0 -profile:v high",
		},
		{
			VideoMetadata{Width: 1080, Height: 1920}, Preset{Width: 1920, Height: 1080}, 0,
			"-c:v:0 libx264 -c:a:0 aac -filter:v:0 scale=1920:1920:force_original_aspect_ratio=decrease -crf 22 -preset faster -bf 2 -coder 1 -sc_threshold 0 -profile:v high",
		},
		{
			VideoMetadata{Width: 1080, Height: 1920}, Preset{Width: 1280, Height: 720}, 0,
			"-c:v:0 libx264 -c:a:0 aac -filter:v:0 scale=1280:1280:force_original_aspect_ratio=decrease -crf 22 -preset faster -bf 2 -coder 1 -sc_threshold 0 -profile:v high",
		},
		{
			VideoMetadata{Width: 1024, Height: 768}, Preset{Width: 854, Height: 360}, 0,
			"-c:v:0 libx264 -c:a:0 aac -filter:v:0 scale=854:854:force_original_aspect_ratio=decrease -crf 22 -preset faster -bf 2 -coder 1 -sc_threshold 0 -profile:v high",
		},
	}

	for _, test := range tests {
		testname := fmt.Sprintf("%dx%d x264 commands", test.v.Width, test.v.Height)
		t.Run(testname, func(t *testing.T) {
			recieved := strings.Join(X264(test.v, test.p, test.streamId), " ")
			if recieved != test.expected {
				t.Errorf("expected %s, recieved %s", test.expected, recieved)
			}
		})
	}
}

func TestGetPresetsVideo(t *testing.T) {
	tests := []struct {
		v        VideoMetadata
		expected []Preset
	}{
		{
			VideoMetadata{Width: 1920, Height: 1080},
			[]Preset{
				{Width: 640, Height: 360, Name: "360"},
				{Width: 1280, Height: 720, Name: "720"},
				{Width: 1920, Height: 1080, Name: "1080"},
			},
		},
		{
			VideoMetadata{Width: 1080, Height: 1920},
			[]Preset{
				{Width: 640, Height: 360, Name: "360"},
				{Width: 1280, Height: 720, Name: "720"},
				{Width: 1920, Height: 1080, Name: "1080"},
			},
		},
		{
			VideoMetadata{Width: 608, Height: 1080},
			[]Preset{
				{Width: 640, Height: 360, Name: "360"},
			},
		},
	}

	for _, test := range tests {
		testname := fmt.Sprintf("%dx%d x264 commands", test.v.Width, test.v.Height)
		t.Run(testname, func(t *testing.T) {
			presets := GetPresets(test.v)

			if len(presets) != len(test.expected) {
				t.Errorf("Expected: %v, Recieved: %v", len(test.expected), len(presets))
			}

			for i := 0; i < len(test.expected); i++ {
				preset := presets[i]
				expected := test.expected[i]
				if !reflect.DeepEqual(preset, expected) {
					t.Errorf("Expected: %v, Recieved: %v", expected, preset)
				}
			}
		})
	}
}

func TestGetMetadata(t *testing.T) {
	var tests = []struct {
		url      string
		metadata VideoMetadata
	}{
		{"https://cdn.bken.io/tests/with-audio.mp4", VideoMetadata{
			Framerate: 30,
			Height:    720,
			Width:     1280,
			Bitrate:   2084419,
			Duration:  20.373332977294922,
		}},
		{"https://cdn.bken.io/tests/no-audio.mp4", VideoMetadata{
			Framerate: 60,
			Height:    768,
			Width:     1024,
			Bitrate:   11918866,
			Duration:  1.3391000032424927,
		}},
	}

	for _, tt := range tests {
		testname := fmt.Sprintln(tt.url)
		t.Run(testname, func(t *testing.T) {
			metadata := GetMetadata(tt.url)
			if metadata != tt.metadata {
				t.Errorf("got %v, want %v", metadata, tt.metadata)
			}
		})
	}
}
