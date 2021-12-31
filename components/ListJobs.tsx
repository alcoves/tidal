import Job from './Job'
import useSWR from 'swr'
import { VStack } from '@chakra-ui/react'
import { fetcher } from '../config/axios'

export default function ListJobs() {
  const { data, error } = useSWR('/api/jobs', fetcher, { refreshInterval: 3000 })

  if (!data) return <></>
  if (error) return <>{JSON.stringify(error)}</>

  return (
    <VStack spacing={2} pt='4'>
      {data?.jobs?.map((j: any) => {
        return <Job key={j.id} job={j} />
      })}
    </VStack>
  )
}
