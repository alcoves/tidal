import chalk from 'chalk'
import { Job } from 'bullmq'
import queues from './queues'
import { WebhookJobData } from '../types'

const GLOBAL_WEBHOOKS_DISABLED = Boolean(process.env.DISABLE_WEBHOOKS === 'true')

interface EventOptions {
  webhooksDisabled: boolean
}

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
  if (!GLOBAL_WEBHOOKS_DISABLED) {
    queues.webhooks.queue.add('dispatch', webhookBody)
  }
  console.log(chalk.yellow(`global webhooks are disabled`))
}

export async function onFailed(job: Job, err: Error, prev: string, opts: EventOptions) {
  console.log(chalk.red.bold(`${job.queueName}:${job.id} :: ${err.message}`))
  opts.webhooksDisabled ? null : await enqueueWebhook(job)
}

export async function onProgress(job: Job, opts: EventOptions) {
  console.log(chalk.yellow(`${job.queueName}:${job.id} :: ${job.progress}`))
  opts.webhooksDisabled ? null : await enqueueWebhook(job)
}

export async function onCompleted(job: Job, opts: EventOptions) {
  console.log(chalk.green.bold(`${job.queueName}:${job.id}`))
  opts.webhooksDisabled ? null : await enqueueWebhook(job)
}

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
