
export function generateManifest() {
  return `#EXTM3U
#EXT-X-VERSION:5
#EXT-X-INDEPENDENT-SEGMENTS

#EXT-X-STREAM-INF:BANDWIDTH=2516370,AVERAGE-BANDWIDTH=8516370,CODECS="mp4a.40.2,avc1.640020",RESOLUTION=2560x1440,CLOSED-CAPTIONS=NONE
https://s3.us-east-2.wasabisys.com/cdn.bken.io/tests/hls2/stream.m3u8
  `
}