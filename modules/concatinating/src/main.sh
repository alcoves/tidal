function handler () {
  set -e

  SQS_BODY=$(echo $1 | jq -r '.Records[0].body')
  echo "SQS_BODY: $SQS_BODY"
  
  BUCKET=$(echo $SQS_BODY | jq -r '.Records[0].s3.bucket.name')
  echo "BUCKET: ${BUCKET}"

  KEY=$(echo $SQS_BODY | jq -r '.Records[0].s3.object.key')
  echo "KEY: ${KEY}"
  
  version="0002"
  expr $version + 1
  echo "$version"

  # SEGMENT_NUMBER = 0
  # CURRENT_LEVEL = 1

  # IF SEGMENT_NUMBER is even
  # then ODD_SEGMENT is SEGMENT_NUMBER + 1 and EVEN_SEGMENT is SEGMENT_NUMBER
  # else ODD_SEGMENT is SEGMENT_NUMBER and EVEN_SEGMENT is SEGMENT_NUMBER - 1

  # Does the other segment exist?
  # IE, PARTNER_SEGMENT = SEGMENT_NUMBER = EVEN_SEGMENT ? ODD_SEGMENT : EVEN_SEGMENT
  # ls PARTNER_SEGMENT
  
  ## No, early return

  ## Yes, concat EVEN_SEGMENT & ODD_SEGMENT

    # echo "creating manifest"
    # touch /tmp/manifest.txt

    # echo "file '$(aws s3 presign ${IN_PATH})'" >> /tmp/manifest.txt;
    # echo "file '$(aws s3 presign ${CONCAT_WITH})'" >> /tmp/manifest.txt;

    # echo "concatinating started"
    # /opt/ffmpeg/ffmpeg -f concat -safe 0 \
    #   -protocol_whitelist "file,http,https,tcp,tls" \
    #   -i /tmp/manifest.txt \
    #   -c:v copy \
    #   -f matroska - | \
    #   aws s3 cp - $OUT_PATH

    # rm -f /tmp/manifest.txt
    # echo "concatinating completed"


  ## store at segments/transcoded/id/preset/l(l + 1)/${EVEN_SEGMENT}.mkv
}
