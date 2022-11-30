import Hls from 'hls.js'
import { useEffect, useRef, useState } from 'react'

export default function VideoPlayer({ src }: { src: string }) {
  const videoEl = useRef(null)
  const [hls, setHls] = useState<any>(null)

  useEffect(() => {
    if (videoEl.current) {
      if (src.includes('.m3u8')) {
        const hls = new Hls()
        hls.attachMedia(videoEl.current)
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          hls.loadSource(src)
        })

        setHls(hls)
      }
    }

    return () => {
      if (hls) hls.destroy()
      setHls(null)
    }
  }, [])

  if (src.includes('.m3u8')) {
    return <video ref={videoEl} controls />
  } else {
    return <video src={src} controls />
  }
}
