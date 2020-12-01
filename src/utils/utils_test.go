package utils

import (
	"fmt"
	"testing"
)

func TestCalcScale(t *testing.T) {
	tests := []struct {
		w, h, dw, dh, rotation int
		expected               string
	}{
		{1920, 1080, 1920, 1080, 0, "scale=1920:-2"},
		{1080, 1920, 1920, 1080, 0, "scale=1080:-2"},
		{1080, 1920, 1920, 1080, 90, "scale=-2:1080"},
	}

	for _, test := range tests {
		testname := fmt.Sprintf("%dx%d video with %d rotation has %s", test.w, test.h, test.rotation, test.expected)
		t.Run(testname, func(t *testing.T) {
			recieved := CalcScale(test.w, test.h, test.dw, test.dh, test.rotation)
			if recieved != test.expected {
				t.Errorf("expected %s, recieved %s", recieved, test.expected)
			}
		})
	}
}

func TestGetPresetsHorizontalVideo(t *testing.T) {
	v := Video{
		bitrate:   0,
		rotate:    0,
		duration:  600,
		height:    1080,
		width:     1920,
		framerate: "60/1",
	}

	expectedPresets := Presets{
		Preset{
			Name: "360p",
			Cmd:  "-vf fps=fps=60/1,scale=640:-2 -bf 2 -crf 22 -coder 1 -c:v libx264 -preset faster -sc_threshold 0 -profile:v high -pix_fmt yuv420p -force_key_frames expr:gte(t,n_forced*2)",
		},
		Preset{
			Name: "720p",
			Cmd:  "-vf fps=fps=60/1,scale=1280:-2 -bf 2 -crf 22 -coder 1 -c:v libx264 -preset faster -sc_threshold 0 -profile:v high -pix_fmt yuv420p -force_key_frames expr:gte(t,n_forced*2)",
		},
		Preset{
			Name: "1080p",
			Cmd:  "-vf fps=fps=60/1,scale=1920:-2 -bf 2 -crf 22 -coder 1 -c:v libx264 -preset faster -sc_threshold 0 -profile:v high -pix_fmt yuv420p -force_key_frames expr:gte(t,n_forced*2)",
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
		bitrate:   0,
		rotate:    90,
		duration:  600,
		height:    1920,
		width:     1080,
		framerate: "60/1",
	}

	expectedPresets := Presets{
		Preset{
			Name: "360p",
			Cmd:  "-vf fps=fps=60/1,scale=-2:480 -bf 2 -crf 22 -coder 1 -c:v libx264 -preset faster -sc_threshold 0 -profile:v high -pix_fmt yuv420p -force_key_frames expr:gte(t,n_forced*2)",
		},
		Preset{
			Name: "720p",
			Cmd:  "-vf fps=fps=60/1,scale=-2:720 -bf 2 -crf 22 -coder 1 -c:v libx264 -preset faster -sc_threshold 0 -profile:v high -pix_fmt yuv420p -force_key_frames expr:gte(t,n_forced*2)",
		},
		Preset{
			Name: "1080p",
			Cmd:  "-vf fps=fps=60/1,scale=-2:1080 -bf 2 -crf 22 -coder 1 -c:v libx264 -preset faster -sc_threshold 0 -profile:v high -pix_fmt yuv420p -force_key_frames expr:gte(t,n_forced*2)",
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
