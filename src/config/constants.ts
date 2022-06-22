if (!process.env.DEFAULT_BUCKET) throw new Error('DEFAULT_BUCKET must be defined')

const config = {
  RCLONE_REMOTE: 'doco',
  DEFAULT_BUCKET: process.env.DEFAULT_BUCKET,
}

export default config
