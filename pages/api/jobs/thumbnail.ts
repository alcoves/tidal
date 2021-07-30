import type { NextApiRequest, NextApiResponse } from 'next'
import thumbnail from '../../../lib/thumbnail'

type Data = {
  data: string
}

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    try {
      await thumbnail({
        rcloneSourceUri: req.body.rcloneSourceUri,
        rcloneDestinationUri: req.body.rcloneDestinationUri
      })
      return res.status(200).end()
    } catch (error) {
      return res.status(500).end()
    }
  }
  res.status(405).end()
}
