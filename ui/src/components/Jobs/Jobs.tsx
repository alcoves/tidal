import { Box } from "@chakra-ui/react";

import { useQuery } from 'react-query'
import { getQueueJobs } from "../../services/getQueueJobs";

export default function Jobs() {
  const { isLoading, isError, data, error } = useQuery('jobs', getQueueJobs)

  return (
    <Box>
      Jobs
      <pre>
        {JSON.stringify(data)}
      </pre>
    </Box>
  )
}