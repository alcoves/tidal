package utils

import (
	"fmt"
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
		w, h, dw int
		expected string
	}{
		{1920, 1080, 640, "scale=640:360"},
		{1440, 1080, 640, "scale=640:480"},
		{1920, 1200, 1280, "scale=1280:800"},
		{1920, 1080, 1920, "scale=1920:1080"},
		{1920, 1080, 1920, "scale=1920:1080"},
		{720, 1568, 720, "scale=720:1568"},
		{888, 544, 854, "scale=854:524"},
	}

	for _, test := range tests {
		testname := fmt.Sprintf("%dx%d video has scale filter %s", test.w, test.h, test.expected)
		t.Run(testname, func(t *testing.T) {
			recieved := CalcScale(test.w, test.h, test.dw)
			if recieved != test.expected {
				t.Errorf("expected %s, recieved %s", test.expected, recieved)
			}
		})
	}
}

func TestGetPresetsVideo(t *testing.T) {
	v := VideoMetadata{
		Bitrate:   0,
		Duration:  600,
		Width:     1920,
		Height:    1080,
		Framerate: 60,
	}

	expectedPresets := []Preset{
		{
			Name:   "360",
			Width:  640,
			Height: 360,
		},
		{
			Name:   "720",
			Width:  1280,
			Height: 720,
		},
		{
			Name:   "1080",
			Width:  1920,
			Height: 1080,
		},
	}

	recievedPresets := GetPresets(v)

	if len(expectedPresets) != len(recievedPresets) {
		t.Errorf("expectedPresets:%d\nrecievedPresets:%d", len(expectedPresets), len(recievedPresets))
	}

	for i := 0; i < len(expectedPresets); i++ {
		if expectedPresets[i].Height != recievedPresets[i].Height {
			t.Errorf("\nexpected\n%d\nrecieved\n%d", expectedPresets[i].Height, recievedPresets[i].Height)
		}
	}

	for i := 0; i < len(expectedPresets); i++ {
		if expectedPresets[i].Width != recievedPresets[i].Width {
			t.Errorf("\nexpected\n%d\nrecieved\n%d", expectedPresets[i].Width, recievedPresets[i].Width)
		}
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
