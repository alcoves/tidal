export function getPreset(preset: string): string {
  switch (preset) {
    case 'x264_1080p':
      return '-an -c:v libx264 -crf 22 -preset medium -vf scale=1920:1920:force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2'
    case 'x264_720p':
      return '-an -c:v libx264 -crf 22 -preset medium -vf scale=1280:1280:force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2'
    default:
      throw new Error('failed to get preset')
  }
}
