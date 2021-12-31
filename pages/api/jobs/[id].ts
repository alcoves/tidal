import db from '../../../config/db'
import type { NextApiRequest, NextApiResponse } from 'next'
import { transcode } from '../../../src/lib/startJob'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // if (req.method === 'GET') {
  //   const jobs = await db.job.findMany()
  //   return res.status(200).json({ jobs })
  // }

  if (req.method === 'POST') {
    const jobId: string = req.query.id as string
    console.log(`Starting job ${jobId}`)

    const job = await db.job.findFirst({ where: { id: parseInt(jobId) } })
    await transcode(job)

    return res.status(200).json(job)
  }
}
