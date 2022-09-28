import { Box, Button } from '@chakra-ui/react'

import { useQuery } from 'react-query'
import { Link, Outlet } from 'react-router-dom'
import { getQueueJobs } from '../../services/getQueueJobs'

export default function Jobs() {
  const { isLoading, isError, data, error } = useQuery('jobs', getQueueJobs)

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
