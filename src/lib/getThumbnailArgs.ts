export default function getThumbnailArgs(): string[] {
  return [
    "-vf", "scale=854:480:force_original_aspect_ratio=increase,crop=854:480",
    "-vframes", "1", "-q:v", "80", "-f", "image2"
  ]
}