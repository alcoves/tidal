# Overview

Tidal is a media processing service written in typescript. It uses redis, ffmpeg, and REST to perform various tasks

## Building

```
docker build -t tidal -f docker/Dockerfile .
```


## S3 Directory Format

/v/:id/job.json - The job file, updated periodically during processing
/v/:id/main.m3u8 - The HLS manifest
/v/:id/thumbnail.webp - The thumbnail for the video
/v/:id/storyboard.webp - The storyboard for the video
