The segmenter invokes the first round of transformer requests

For each segment, publish a message that says

```
in_path: 's3://tidal-bken-dev/segments/id/source/000.mkv',
out_path: 's3://tidal-bken-dev/segments/id/libvpx_vp9-1080p/000.mkv',
ffmpeg_cmd: '-c:v libvpx-vp9 -crf 38 -b:f 0',
concat_with: 's3://tidal-bken-dev/segments/id/source/001.mkv',
```

The first requests

```
in_path: 's3://tidal-bken-dev/segments/id/source/000.mkv',
out_path: 's3://tidal-bken-dev/segments/id/libvpx_vp9-1080p/000.mkv',
ffmpeg_cmd: '-c:v libvpx-vp9 -crf 38 -b:f 0',
concat_with: 's3://tidal-bken-dev/segments/id/source/001.mkv',
```

`ffmpeg -i in_path -i concat_with ffmpeg_cmd | out_path`

The next requests

```
in_path: 's3://tidal-bken-dev/segments/id/source/000.mkv',
out_path: 's3://tidal-bken-dev/segments/id/libvpx_vp9-1080p/l2/000.mkv',
ffmpeg_cmd: '-c:v libvpx-vp9 -crf 38 -b:f 0',
concat_with: 's3://tidal-bken-dev/segments/id/source/001.mkv',
```

``
