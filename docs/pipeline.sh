#!/bin/bash
set -e

echo "Cleaning up workspace"
rm -rf segments && rm -rf transcoded && rm -f concat-manifest.txt
mkdir segments && mkdir transcoded

echo "Create test video"
# ffmpeg -y -f lavfi -i sine=frequency=1000:sample_rate=48000:duration=60 -f lavfi -i testsrc=duration=60:size=1280x720:rate=60 test.mp4

echo "Segmenting video"
ffmpeg -y -i test.mp4 -c:v copy -f segment -segment_time 10 -an segments/%06d.mkv

echo "Transcoding segments"
for PART in $(ls segments); do
  ffmpeg -y -i ./segments/$PART -c:v libx264 -crf 22 ./transcoded/$PART;
  echo "file './transcoded/$PART'" >> concat-manifest.txt;
done

echo "Concatinating transcoded segments"
# Create concated video
ffmpeg -y -f concat -safe 0 -i concat-manifest.txt -c:v copy converted.mkv;

# Pull audio from source
# Dont assume the audio is aac
ffmpeg -y -i test.mp4 test.wav

# Combine converted video with original audio track
ffmpeg -y -i converted.mp4 -i test.wav -c:v copy -f mp4 -movflags faststart+frag_keyframe+empty_moov converted-with-audio.mp4

echo "Exporting audio for spectro analysis"
ffmpeg -y -i test.mp4 test.wav
ffmpeg -y -i converted-with-audio.mp4 converted.wav

echo "Creating spectrograms"
sox test.wav -n spectrogram -Y 400 -c "Input file" -o test.png
sox converted.wav -n spectrogram -Y 400 -c "Concat file" -o converted.png

SOURCE_VIDEO_DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 test.mp4)
CONVERTED_VIDEO_DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 converted.mp4)
CONVERTED_VIDEO_WITH_AUDIO_DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 converted-with-audio.mp4)
echo "Source Duration: $SOURCE_VIDEO_DURATION"
echo "Converted Duration: $CONVERTED_VIDEO_DURATION"
echo "Converted Video With Audio Duration: $CONVERTED_VIDEO_DURATION"