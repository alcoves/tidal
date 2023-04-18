export default () => ({
  test: process.env.PORT || 'test',
});

export enum JOB_QUEUES {
  TRANSCODE = 'transcode',
  TRANSCRIBE = 'transcribe',
  SEGMENTATION = 'segmentation',
  CONCATENATION = 'concatenation',
}
