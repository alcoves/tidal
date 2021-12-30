import { Button, Flex } from '@chakra-ui/react'

export default function Dashboard() {
  return (
    <Flex direction='column' w='100%' p='4'>
      <Flex justify='end'>
        <Button variant='solid'>Add</Button>
      </Flex>
      <Flex>Here are the videos</Flex>
    </Flex>
  )
}
