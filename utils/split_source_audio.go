package utils

import log "github.com/sirupsen/logrus"

func SplitSourceAudio(request SplitSourceAudioRequest) string {
	log.Debug("Splitting source audio")
	sourceAudioPath := request.JobDir + "/audio.wav"
	Ffmpeg([]string{
		"-hide_banner", "-y",
		"-i", request.SourceURI,
		"-vn",
		sourceAudioPath,
	})
	return sourceAudioPath
}
