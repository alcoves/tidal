// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  data: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {


  if (req.method === 'GET') {
    res.status(200).json({ data: 'John Doe' })
  } else if (req.method === 'POST') {
    // If the user is single node mode...then call the cli from here and return

    // If the user is in clustered mode...then enqueue job into nomad and return
    res.status(200).json({ data: 'John Doe' })
  }

  res.status(405).end();
}
