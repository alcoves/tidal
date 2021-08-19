import type { NextApiRequest, NextApiResponse } from 'next'
import Consul from 'consul'

type Data = {
  data: Array<unknown>
}

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'GET') {
    console.log('Getting Jobs')
    try {
      const consul = Consul({ promisify: true })
      const results = await consul.kv.keys('tidal/jobs/')
      const fullResults = []

      for (const result of results) {
        const keyId = result.split('/')[2]
        if (keyId) {
          console.log('Getting Key', keyId)
          const job = await consul.kv.get(result)
          if (job) {
            job.Value = JSON.parse(job.Value)
            console.log(job)
            fullResults.push(job)
          }
        }
      }

      return res.status(200).json({
        data: fullResults
      })
    } catch (error) {
      return res.status(500).end()
    }
  }
  res.status(405).end()
}
