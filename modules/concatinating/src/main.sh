function handler () {
  SQS_BODY=$(echo $1 | jq -r '.Records[0].body')
  echo "SQS_BODY: $SQS_BODY"

  IN_PATH="$(echo $SQS_BODY | jq -r '.in_path')"
  OUT_PATH="$(echo $SQS_BODY | jq -r '.out_path')"

  LAMBDA_SIZE_LIMIT="419430400"
  TOTAL_SEGMENT_SIZE="$(aws s3 ls $IN_PATH --recursive --summarize | grep "Total Size: " | cut -d':' -f2 | xargs)"

  echo "LAMBDA_SIZE_LIMIT: $LAMBDA_SIZE_LIMIT"
  echo "TOTAL_SEGMENT_SIZE: $TOTAL_SEGMENT_SIZE"

  if (( $TOTAL_SEGMENT_SIZE < $LAMBDA_SIZE_LIMIT )); then
    echo "Video is getting concatinated on Lambda"
    ./concat.sh $IN_PATH $OUT_PATH
  else
    echo "segments were larger than 400mb"
    exit 1
    # echo "invoking concatination server"
    # curl -X GET "http://172.31.33.233:4000/concat?in_path=${IN_PATH}&out_path=${OUT_PATH}"
    # echo "concatination completed"
  fi
}