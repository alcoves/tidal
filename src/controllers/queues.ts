import { queues } from '../lib/bullmq'

export async function getQueue(req, res) {
  const queueName = req.params.queueId
  const queue = queues[queueName]
  if (!queue) return res.status(404).end()

  return res.json({
    counts: await queue.queue.getJobCounts(),
    jobs: await queue.queue.getJobs(),
  })
}

export async function retryFailedJobs(req, res) {
  const queueName = req.params.queueId
  const queue = queues[queueName]
  if (!queue) return res.status(404).end()

  const failedJobs = await queue.queue.getFailed()
  await Promise.all(
    failedJobs.map(j => {
      return j.retry()
    })
  )

  return res.status(200).end()
}

export async function cleanQueues(req, res) {
  let removed = 0
  for (const { queue } of Object.values(queues)) {
    const deletedIds = await queue.clean(0, 10000000, 'completed')
    removed += deletedIds.length
  }
  return res.json({ removed })
}
