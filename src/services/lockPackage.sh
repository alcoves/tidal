#!/bin/bash
set -e

while true; do
  if consul kv get $LOCK_KEY; then
    echo "lock found...looping..."
    sleep 3;
  else
    PLAYLIST_DIR=$(mktemp -d)
    REMOTE_MASTER_PATH="s3://cdn.bken.io/v/${VIDEO_ID}/hls/master.m3u8"

    echo "PLAYLIST_DIR: $PLAYLIST_DIR"
    echo "REMOTE_MASTER_PATH: $REMOTE_MASTER_PATH"

    echo "downloading all manifests"
    aws s3 cp s3://cdn.bken.io/v/$VIDEO_ID/hls/ \
      $PLAYLIST_DIR \
      --recursive \
      --exclude "*" \
      --include "*stream.m3u8" \
      --profile wasabi \
      --endpoint=https://us-east-2.wasabisys.com

    echo "moving local hls into merge dir"
    mkdir -p $PLAYLIST_DIR/$PRESET_NAME
    mv $HLS_DIR/stream.m3u8 $PLAYLIST_DIR/$PRESET_NAME/stream.m3u8

    echo "creating master manifest"
    HLS_MASTER=$PLAYLIST_DIR/master.m3u8
    touch $HLS_MASTER
    echo "#EXTM3U" >> $HLS_MASTER

    for PRESET_DIR in $(ls -rv $PLAYLIST_DIR -I "master.m3u8") ; do
      SEARCH_KEYWORD="STREAM-INF:"
      STREAM_INF=$(grep "$SEARCH_KEYWORD" $PLAYLIST_DIR/$PRESET_DIR/stream.m3u8 | cut -d':' -f2)

      if test -z "$STREAM_INF" 
      then
        echo "failed to find $SEARCH_KEYWORD in $PRESET_DIR"
      else
        echo "adding $STREAM_INF for $PRESET_DIR to master playlist"
        echo "#EXT-X-STREAM-INF:$STREAM_INF" >> $HLS_MASTER
        echo "$PRESET_DIR/stream.m3u8" >> $HLS_MASTER
      fi
    done

    echo "uploading manifest"
    aws s3 cp $HLS_MASTER \
      $REMOTE_MASTER_PATH \
      --quiet \
      --profile wasabi \
      --endpoint=https://us-east-2.wasabisys.com

    echo "removing tmp dir"
    rm -rf $PLAYLIST_DIR

    echo "removing lock"
    consul kv delete $LOCK_KEY

    echo "breaking out of loop"
    break
  fi
done