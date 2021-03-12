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

func TestGetPresetsHorizontalVideo(t *testing.T) {
	v := Video{
		Bitrate:   0,
		Rotate:    0,
		Duration:  600,
		Width:     1920,
		Height:    1080,
		Framerate: 60,
	}

	expectedPresets := Presets{
		Preset{
			Name: "360",
			Cmd:  "-vf fps=fps=60.000000,scale=640:360 -bf 2 -crf 22 -coder 1 -c:v libx264 -preset faster -sc_threshold 0 -profile:v high -pix_fmt yuv420p -force_key_frames expr:gte(t,n_forced*2)",
		},
		Preset{
			Name: "720",
			Cmd:  "-vf fps=fps=60.000000,scale=1280:720 -bf 2 -crf 22 -coder 1 -c:v libx264 -preset faster -sc_threshold 0 -profile:v high -pix_fmt yuv420p -force_key_frames expr:gte(t,n_forced*2)",
		},
		Preset{
			Name: "1080",
			Cmd:  "-vf fps=fps=60.000000,scale=1920:1080 -bf 2 -crf 22 -coder 1 -c:v libx264 -preset faster -sc_threshold 0 -profile:v high -pix_fmt yuv420p -force_key_frames expr:gte(t,n_forced*2)",
		},
	}

	recievedPresets := GetPresets(v)

	if len(expectedPresets) != len(recievedPresets) {
		t.Errorf("expectedPresets:%d\nrecievedPresets:%d", len(expectedPresets), len(recievedPresets))
	}

	for i := 0; i < len(expectedPresets); i++ {
		if expectedPresets[i].Cmd != recievedPresets[i].Cmd {
			t.Errorf("\nexpected\n%s\nrecieved\n%s", expectedPresets[i].Cmd, recievedPresets[i].Cmd)
		}
	}
}

func TestGetPresetsVerticalVideo(t *testing.T) {
	v := Video{
		Bitrate:   0,
		Rotate:    90,
		Duration:  600,
		Width:     1920,
		Height:    1080,
		Framerate: 60,
	}

	expectedPresets := Presets{
		Preset{
			Name: "360",
			Cmd:  "-vf fps=fps=60.000000,scale=640:360 -bf 2 -crf 22 -coder 1 -c:v libx264 -preset faster -sc_threshold 0 -profile:v high -pix_fmt yuv420p -force_key_frames expr:gte(t,n_forced*2)",
		},
		Preset{
			Name: "720",
			Cmd:  "-vf fps=fps=60.000000,scale=1280:720 -bf 2 -crf 22 -coder 1 -c:v libx264 -preset faster -sc_threshold 0 -profile:v high -pix_fmt yuv420p -force_key_frames expr:gte(t,n_forced*2)",
		},
		Preset{
			Name: "1080",
			Cmd:  "-vf fps=fps=60.000000,scale=1920:1080 -bf 2 -crf 22 -coder 1 -c:v libx264 -preset faster -sc_threshold 0 -profile:v high -pix_fmt yuv420p -force_key_frames expr:gte(t,n_forced*2)",
		},
	}

	recievedPresets := GetPresets(v)

	if len(expectedPresets) != len(recievedPresets) {
		t.Errorf("expectedPresets:%d\nrecievedPresets:%d", len(expectedPresets), len(recievedPresets))
	}

	for i := 0; i < len(expectedPresets); i++ {
		if expectedPresets[i].Cmd != recievedPresets[i].Cmd {
			t.Errorf("\nexpected\n%s\nrecieved\n%s", expectedPresets[i].Cmd, recievedPresets[i].Cmd)
		}
	}
}

func TestGetPresetsVideo(t *testing.T) {
	v := Video{
		Bitrate:   0,
		Rotate:    0,
		Duration:  30,
		Width:     720,
		Height:    1568,
		Framerate: 60,
	}

	expectedPresets := Presets{
		Preset{
			Name: "360",
			Cmd:  "-vf fps=fps=60.000000,scale=640:1394 -bf 2 -crf 22 -coder 1 -c:v libx264 -preset faster -sc_threshold 0 -profile:v high -pix_fmt yuv420p -force_key_frames expr:gte(t,n_forced*2)",
		},
		Preset{
			Name: "720",
			Cmd:  "-vf fps=fps=60.000000,scale=1280:2788 -bf 2 -crf 22 -coder 1 -c:v libx264 -preset faster -sc_threshold 0 -profile:v high -pix_fmt yuv420p -force_key_frames expr:gte(t,n_forced*2)",
		},
	}

	recievedPresets := GetPresets(v)

	if len(expectedPresets) != len(recievedPresets) {
		t.Errorf("expectedPresets:%d\nrecievedPresets:%d", len(expectedPresets), len(recievedPresets))
	}

	for i := 0; i < len(expectedPresets); i++ {
		if expectedPresets[i].Cmd != recievedPresets[i].Cmd {
			t.Errorf("\nexpected\n%s\nrecieved\n%s", expectedPresets[i].Cmd, recievedPresets[i].Cmd)
		}
	}
}
