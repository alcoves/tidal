import { Job } from 'bullmq'
import queues from '../queues/queues'

export async function listQueues(req, res) {
  const listQueueReponse: any[] = []

  for (const queueName of Object.keys(queues)) {
    listQueueReponse.push({
      name: queueName,
      counts: await queues[queueName].queue.getJobCounts(),
    })
  }

  return res.json({ queues: listQueueReponse })
}

export async function getQueue(req, res) {
  const { queueName } = req.params
  const selectedQueue = queues[queueName].queue

  return res.json({
    jobs: await selectedQueue.getJobs(),
    counts: await selectedQueue.getJobCounts(),
  })
}

export async function getQueueJob(req, res) {
  const { queueName, jobId } = req.params
  const selectedQueue = queues[queueName].queue
  const selectedJob = await Job.fromId(selectedQueue, jobId)
  if (!selectedJob) return res.sendStatus(404)

  return res.json({ job: selectedJob })
}

export async function retryJob(req, res) {
  const { queueName, jobId } = req.params
  const selectedQueue = queues[queueName].queue
  const selectedJob = await Job.fromId(selectedQueue, jobId)
  if (!selectedJob) return res.sendStatus(404)

  await selectedJob.retry()
  return res.json({ job: selectedJob })
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
