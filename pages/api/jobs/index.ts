import db from '../../../config/db'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getMetadata } from '../../../src/lib/getMetadata'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const jobs = await db.job.findMany({ orderBy: [{ id: 'desc' }] })
    return res.status(200).json({ jobs })
  }

  if (req.method === 'POST') {
    const { input, output, externalId }: { input: string; output: string; externalId: string } =
      req.body
    if (!input || !output) return res.status(400).end()
    const metadata = await getMetadata(req.body.input)

    const job = await db.job.create({
      data: {
        input,
        output,
        externalId,
        cmd: '-c:v libx264 -crf 32',
        metadata: JSON.stringify(metadata),
      },
    })

    return res.status(200).json(job)
  }
}
