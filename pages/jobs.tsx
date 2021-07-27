import { Box, Button } from '@chakra-ui/react'
import { useState } from 'react'

export default function Jobs () {
  // gets jobs with swr
  const [res, setRes] = useState('')

  async function handleClick () {
    // Make remote call
    const res = await fetch('/api/jobs', { method: 'POST', body: { data: 'test' } })
    console.log(res)
    setRes(JSON.stringify(res))
  }

  return (
    <Box>
      <Button onClick={handleClick}>
        Run Job
      </Button>
      <pre>
        {res}
      </pre>
    </Box>
  )
}
