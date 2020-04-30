#!/bin/bash
set -e

echo "Cleaning up workspace"
rm -rf ./tmp/segments && rm -rf ./tmp/transcoded && rm -f ./tmp/concat-manifest.txt
mkdir ./tmp/segments && mkdir ./tmp/transcoded

echo "Create test video"
# ffmpeg -y -f lavfi -i sine=frequency=1000:sample_rate=48000:duration=60 -f lavfi -i testsrc=duration=60:size=1280x720:rate=60 test.mp4

echo "Segmenting video"
ffmpeg -y -i ./tmp/test.mp4 -c:v copy -f segment -segment_time 1 -an ./tmp/segments/%06d.mkv

echo "Transcoding segments"
for PART in $(ls ./tmp/segments); do
  ffmpeg -y -i ./tmp/segments/$PART -c:v libvpx-vp9 -speed 5 -deadline realtime -b:v 0 -crf 30 -vf scale=832:-2 ./tmp/transcoded/$PART;
  echo "file './transcoded/$PART'" >> ./tmp/concat-manifest.txt;
done

echo "Concatinating transcoded segments"
# Create concated video
ffmpeg -y -f concat -safe 0 -i ./tmp/concat-manifest.txt -c:v copy ./tmp/converted.mkv;

# Pull audio from source
# Dont assume the audio is aac
ffmpeg -y -i ./tmp/test.mp4 ./tmp/test.wav

# Combine converted video with original audio track
ffmpeg -y -i ./tmp/converted.mkv -i ./tmp/test.wav -c:v copy -f webm - | ffmpeg -y -i - -c copy ./tmp/converted-with-audio.webm

echo "Exporting audio for spectro analysis"
ffmpeg -y -i ./tmp/test.mp4 ./tmp/test.wav
ffmpeg -y -i ./tmp/converted-with-audio.webm ./tmp/converted.wav

echo "Creating spectrograms"
sox ./tmp/test.wav -n spectrogram -Y 400 -c "Input file" -o ./tmp/test.png
sox ./tmp/converted.wav -n spectrogram -Y 400 -c "Concat file" -o ./tmp/converted.png

SOURCE_VIDEO_DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ./tmp/test.mp4)
CONVERTED_VIDEO_DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ./tmp/converted.mkv)
CONVERTED_VIDEO_WITH_AUDIO_DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ./tmp/converted-with-audio.webm)

echo "Source Duration: $SOURCE_VIDEO_DURATION"
echo "Converted Duration: $CONVERTED_VIDEO_DURATION"
echo "Converted Video With Audio Duration: $CONVERTED_VIDEO_DURATION"
