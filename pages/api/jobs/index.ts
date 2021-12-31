import db from '../../../config/db'
import { getMetadata } from '../../../lib/getMetadata'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSignedURL, getUrlParamsFromS3Uri } from '../../../config/s3'

interface CreateJobBody {
  input: string
  output: string
  externalId: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const jobs = await db.job.findMany({ orderBy: [{ id: 'desc' }] })
    return res.status(200).json({ jobs })
  }

  if (req.method === 'POST') {
    const { input, output, externalId }: CreateJobBody = req.body
    if (!input || !output) return res.status(400).end()

    const { Bucket, Key } = getUrlParamsFromS3Uri(input)
    const signedUrl = await getSignedURL({ Bucket, Key })
    const metadata = await getMetadata(signedUrl)

    const job = await db.job.create({
      data: {
        input,
        output,
        externalId,
        metadata: JSON.stringify(metadata),
        cmd: '-c:v libx264 -crf 23 -preset medium -pix_fmt yuv420p -c:a aac -b:a 128k -ar 44100 -force_key_frames expr:gte(t,n_forced*2) -movflags +faststart',
      },
    })

    return res.status(200).json(job)
  }
}
