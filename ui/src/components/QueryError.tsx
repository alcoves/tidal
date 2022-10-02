import { Alert, AlertDescription, AlertTitle, Box } from '@chakra-ui/react'

export default function QueryError({ error }: { error: any }) {
  return (
    <Box>
      <Alert status='error'>
        <AlertTitle>Error!</AlertTitle>
        <AlertDescription>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </AlertDescription>
      </Alert>
    </Box>
  )
}
