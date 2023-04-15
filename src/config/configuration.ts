export default () => ({
  test: process.env.PORT || 'test',
});

export enum JOB_QUEUES {
  VIDEO_TRANSCODE = 'video_transcodes',
  AUDIO_TRANSCODE = 'audio_transcodes',
}
