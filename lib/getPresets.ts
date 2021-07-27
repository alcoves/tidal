
interface Metadata {

}

export default function getPresets(metadata: Metadata) {



  return [
    {
      name: '1080p',
      width: 1920,
      height: 1080
    },
    {
      name: '720p',
      width: 1280,
      height: 720
    }
  ]
}