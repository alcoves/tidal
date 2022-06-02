import { getTidalQueues } from '../config/queues'

export async function fetchQueues(req, res) {
  return res.json({
    queues: await Promise.all(
      getTidalQueues().map(async ({ name, queue }) => {
        return {
          name: name,
          metrics: {
            jobs: await queue?.getJobCounts(),
          },
        }
      })
    ),
  })
}

export async function cleanQueues(req, res) {
  await Promise.all(
    getTidalQueues().map(async ({ queue }) => {
      if (queue) {
        await queue.clean(1, 1000, 'failed')
        await queue.clean(1, 1000, 'failed')
        await queue.clean(1, 1000, 'completed')
        await queue.clean(1, 1000, 'completed')
      }
    })
  )
  return res.sendStatus(200)
}
