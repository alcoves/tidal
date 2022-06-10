import { Job } from 'bullmq'
import { flow } from './queues'
import { enqueueWebhook } from './webhooks'

export async function onCompleted(job: Job) {
  console.log(`${job.queueName} :: ${job.id} has completed!`)
  if (!job.data?.webhooks) return
  await enqueueWebhook(job)
}

export async function onFailed(job: Job, err) {
  console.log(`${job.queueName} :: ${job.id} has failed with ${err.message}`)
  if (!job.data?.webhooks) return
}

export async function onProgress(job: Job, queueName: string) {
  console.log(`${job.queueName} :: ${job.id} has progress of ${job.progress}`)
  if (!job.data?.webhooks) return

  if (job.data.parentId) {
    const tree = await flow.getFlow({
      queueName,
      id: job.data.parentId,
    })

    if (tree.children) {
      const sumPercentageCompleted = tree.children.reduce((acc: any, { job }) => {
        acc += job.progress
        return acc
      }, 0)
      const percentageDone = sumPercentageCompleted / tree.children.length - 5
      if (percentageDone >= 0) await tree.job.updateProgress(percentageDone)
    }
  }

  await enqueueWebhook(job)
}
