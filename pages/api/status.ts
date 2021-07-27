import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  nomad: boolean,
  consul: boolean
}

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'GET') {
    res.status(200).json({
      nomad: true,
      consul: true
    })
  }
  res.status(405).end()
}
