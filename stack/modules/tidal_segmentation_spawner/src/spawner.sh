function handler () {
  set -e
  EVENT_DATA=$1

  KEY=$(echo $EVENT_DATA | jq -r '.Records[0].s3.object.key')
  BUCKET=$(echo $EVENT_DATA | jq -r '.Records[0].s3.bucket.name')
  OBJECT_SIZE_IN_BYTES=$(echo $EVENT_DATA | jq -r '.Records[0].s3.object.size')

  FILENAME=$(basename $KEY)
  VIDEO_ID=$(basename $(dirname $KEY))
  DISK_SIZE_WITH_PADDING=$((OBJECT_SIZE_IN_BYTES+10000000000))
  DISK_SIZE_GB=$((DISK_SIZE_WITH_PADDING/1073741824))
  SAFE_DISK_SIZE=$((DISK_SIZE_GB*2))

  TMP_DIR="/tmp/$VIDEO_ID"
  SOURCE_PATH=$TMP_DIR/$FILENAME
  SEGMENT_DIR=$TMP_DIR/segments

  echo "KEY: $KEY"
  echo "BUCKET: $BUCKET"
  echo "FILENAME: $FILENAME"
  echo "SAFE_DISK_SIZE: $SAFE_DISK_SIZE"
  echo "OBJECT_SIZE_IN_BYTES: $OBJECT_SIZE_IN_BYTES"

  if [[ $FILENAME == *".mp4"* ]]; then
cat > /tmp/start-segmentation.txt \
<< EOL
#!/bin/bash

echo "installing dependencies"
sudo apt update
sudo apt install -y ffmpeg curl wget awscli

echo "starting segmentation"
mkdir -p $SEGMENT_DIR

aws s3 cp s3://$BUCKET/$KEY $SOURCE_PATH

ffmpeg -y -i $SOURCE_PATH $TMP_DIR/audio.wav
aws s3 cp $TMP_DIR/audio.wav s3://$BUCKET/audio/$VIDEO_ID/audio.wav

ffmpeg -y -i $SOURCE_PATH -c copy -f segment -segment_time 1 -an $SEGMENT_DIR/output_%04d.mp4

aws s3 sync $SEGMENT_DIR s3://$BUCKET/segments/$VIDEO_ID/

# Write metadata file and split audio back to source
ffprobe -v quiet -print_format json -show_format -show_streams $SOURCE_PATH > $TMP_DIR/ffprobe.json
aws s3 cp $TMP_DIR/ffprobe.json s3://$BUCKET/metadata/$VIDEO_ID/ffprobe.json

echo "terminating instance"
sudo shutdown -h now
EOL

cat /tmp/start-segmentation.txt

cat > /tmp/mapping.json \
<< EOL
[
  {
    "DeviceName": "/dev/sda1",
    "Ebs": {
      "Encrypted": false,
      "VolumeType": "gp2",
      "VolumeSize": $SAFE_DISK_SIZE,
      "DeleteOnTermination": true,
      "SnapshotId": "snap-0e078112eedeec9db"
    }
  }
]
EOL

  aws ec2 run-instances \
    --count 1 \
    --key-name bken \
    --instance-type t3a.medium \
    --subnet-id subnet-11635158 \
    --iam-instance-profile Arn=arn:aws:iam::594206825329:instance-profile/ec2-all \
    --security-group-ids sg-665de11a \
    --image-id ami-07ebfd5b3428b6f4d \
    --user-data file:///tmp/start-segmentation.txt \
    --block-device-mappings file:///tmp/mapping.json \
    --instance-initiated-shutdown-behavior terminate
    
  else
    echo "file extension did not match"
  fi

  exit 0
}
