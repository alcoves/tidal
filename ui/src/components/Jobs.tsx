import { Link } from 'react-router-dom'
import { Box, Button } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { getQueueJobs } from '../services/getQueueJobs'

export default function Jobs() {
  const { data } = useQuery(['jobs'], getQueueJobs)
  return (
    <Box>
      Jobs
      <Button size='sm'>
        <Link to='/jobs/add'>Add Job</Link>
      </Button>
      <pre>{JSON.stringify(data)}</pre>
    </Box>
  )
}
