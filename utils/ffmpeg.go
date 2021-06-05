package utils

import (
	"bufio"
	"fmt"
	"os/exec"
	"strconv"
	"strings"

	log "github.com/sirupsen/logrus"
)

func parseFfmpegDuration(str string) float64 {
	timeString := strings.Split(str, "time=")[1]
	timeString = strings.Split(timeString, ".")[0]
	timeStringSplit := strings.Split(timeString, ":")

	hours, err := strconv.Atoi(timeStringSplit[0])
	if err != nil {
		log.Error(err)
	}

	minutes, err := strconv.Atoi(timeStringSplit[1])
	if err != nil {
		log.Error(err)
	}

	seconds, err := strconv.Atoi(timeStringSplit[2])
	if err != nil {
		log.Error(err)
	}

	secondsElapsed := float64((hours * 3600) + (minutes * 60) + (seconds))
	return secondsElapsed
}

func Ffmpeg(args []string, job *TranscodeJob) {
	duration := job.Metadata.Duration
	cmd := exec.Command("ffmpeg", args...)
	fmt.Printf("\n%v\n", cmd.Args)

	stderrPipe, _ := cmd.StderrPipe()
	cmd.Start()

	scanner := bufio.NewScanner(stderrPipe)
	scanner.Split(bufio.ScanWords)
	for scanner.Scan() {
		m := scanner.Text()
		if strings.Contains(m, "time=") {
			secondsElapsed := parseFfmpegDuration(m)
			pc := (secondsElapsed / duration) * 100
			log.Info("Percent Completed: ", pc)
			job.PercentCompleted = pc
			Notify(job)
		}
	}
	cmd.Wait()
}
