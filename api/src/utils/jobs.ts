import { v4 as uuidv4 } from 'uuid'

export function flowTreeFactory() {
  // Builds a flow tree for a given job
  const jobId = uuidv4()

  // Get Presets
  // Filter presets that won't match contraints
  //

  return {
    name: 'output',
    queueName: 'transcode',
    data: {
      webhooks: false,
      input: '',
      output: '',
    },
    children: [
      {
        name: 'preset',
        queueName: 'transcode',
        data: {
          cmd: '',
          input: '',
          output: '',
          parentId: jobId,
          webhooks: false,
        },
      },
    ],
    opts: { jobId, priority: 1 },
  }
}
