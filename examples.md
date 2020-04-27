```sh
cargo run -- segment \
s3://tidal-bken-dev/uploads/3HM4Ka2OS/source.mp4 \
s3://tidal-bken-dev/segments/3HM4Ka2OS/source \
--transcode_queue_url="https://sqs.us-east-1.amazonaws.com/594206825329/tidal-transcoding-dev
```
