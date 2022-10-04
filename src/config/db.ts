import chalk from 'chalk'
import { PrismaClient } from '@prisma/client'

export const db = new PrismaClient()
const GLOBAL_WEBHOOKS_DISABLED = Boolean(process.env.DISABLE_WEBHOOKS === 'true')

// db.$use(async (params, next) => {
// if (params.model == 'Post' && params.action == 'delete') {
//   // Logic only runs for delete action and Post model
// }
// return next(params)

// Manipulate params here
// const result = await next(params)
// See results here
// console.log(chalk.green(`middleware running`, params.model, params.action))
// return result
// })

// export async function enqueueWebhook(job: Job) {
//   const webhookBody: WebhookJobData = {
//     id: job.id,
//     name: job.name,
//     data: job.data,
//     progress: job.progress,
//     queueName: job.queueName,
//     returnValue: job.returnvalue,
//     state: await job.getState(),
//   }
//   if (!GLOBAL_WEBHOOKS_DISABLED) {
//     queues.webhooks.queue.add('dispatch', webhookBody)
//   }
//   console.log(chalk.yellow(`global webhooks are disabled`))
// }
