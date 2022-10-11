import Hls from 'hls.js'
import { useEffect, useRef, useState } from 'react'

export default function VideoPlayer({ src }: { src: string }) {
  console.log('src', src)
  const videoEl = useRef(null)
  const [hls, setHls] = useState<any>(null)

  useEffect(() => {
    if (videoEl.current) {
      const hls = new Hls()
      hls.attachMedia(videoEl.current)
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(src)
      })

      setHls(hls)
    }

    return () => {
      if (hls) hls.destroy()
      setHls(null)
    }
  }, [])

  return <video ref={videoEl} controls />
}
