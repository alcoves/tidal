import { adaptiveTranscode } from '../queues/queues'

export async function getQueueJobs(req, res) {
  return res.json({
    counts: await adaptiveTranscode.queue.getJobCounts(),
    jobs: await adaptiveTranscode.queue.getJobs(),
  })
}

export async function retryFailedJobs(req, res) {
  // const queueName = req.params.queueId
  // const queue = queues[queueName]
  // if (!queue) return res.status(404).end()

  // const failedJobs = await queue.queue.getFailed()
  // await Promise.all(
  //   failedJobs.map(j => {
  //     return j.retry()
  //   })
  // )

  return res.status(200).end()
}

export async function cleanQueues(req, res) {
  // let removed = 0
  // for (const { queue } of Object.values(queues)) {
  //   const deletedIds = await queue.clean(0, 10000000, 'completed')
  //   removed += deletedIds.length
  // }
  // return res.json({ removed })

  return res.status(200).end()
}
