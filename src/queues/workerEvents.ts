import chalk from 'chalk'
import { Job } from 'bullmq'
import { webhooks } from './queues'
import { WebhookJobData } from '../types'

export async function enqueueWebhook(job: Job) {
  const webhookBody: WebhookJobData = {
    id: job.id,
    name: job.name,
    data: job.data,
    progress: job.progress,
    queueName: job.queueName,
    returnValue: job.returnvalue,
    state: await job.getState(),
  }
  webhooks.queue.add('dispatch', webhookBody)
}

export async function onCompleted(job: Job, webhooksDisabled: boolean) {
  console.log(chalk.green.bold(`${job.queueName}:${job.id}`))
  if (process.env.DISABLE_WEBHOOKS === 'true' || webhooksDisabled) return
  await enqueueWebhook(job)
}

export async function onFailed(job: Job, err, webhooksDisabled: boolean) {
  console.log(chalk.red.bold(`${job.queueName}:${job.id} :: ${err.message}`))
  if (process.env.DISABLE_WEBHOOKS === 'true' || webhooksDisabled) return
  await enqueueWebhook(job)
}

export async function onProgress(job: Job, webhooksDisabled: boolean) {
  console.log(chalk.yellow(`${job.queueName}:${job.id} :: ${job.progress}`))
  if (process.env.DISABLE_WEBHOOKS === 'true' || webhooksDisabled) return
  await enqueueWebhook(job)

  // Sets the parent job progress to the sum of all child jobs
  // The only parent jobs right now are in the "publish" queue
  // if (job.data.parentId) {
  //   const tree = await flow.getFlow({
  //     queueName: 'publish',
  //     id: job.data.parentId,
  //   })

  //   if (tree?.children) {
  //     const sumPercentageCompleted = tree.children.reduce((acc: any, { job }) => {
  //       acc += job.progress
  //       return acc
  //     }, 0)
  //     const percentageDone = sumPercentageCompleted / tree.children.length - 5
  //     if (percentageDone >= 0) await tree.job.updateProgress(percentageDone)
  //   }
  // }
}
