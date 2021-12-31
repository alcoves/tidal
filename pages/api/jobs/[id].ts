import db from '../../../config/db'
import { transcode } from '../../../lib/startJob'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const jobId: string = req.query.id as string
    console.log(`Starting job ${jobId}`)

    const job = await db.job.findFirst({ where: { id: parseInt(jobId) } })
    await transcode(job)

    return res.status(200).json(job)
  }

  if (req.method === 'DELETE') {
    const jobId: string = req.query.id as string
    const job = await db.job.findFirst({ where: { id: parseInt(jobId) } })
    if (job?.status === 'PROCESSING') return res.status(400).end()

    await db.job.delete({ where: { id: parseInt(jobId) } })
    return res.status(200).json(job)
  }
}
