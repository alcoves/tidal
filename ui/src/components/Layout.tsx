import { Link } from 'react-router-dom'
import { Box, Button, Flex, Heading, VStack } from '@chakra-ui/react'

function SidebarButton({ to, children }: { to: string; children: any }) {
  return (
    <Button as={Link} to={to} w='100%' justifyContent='start'>
      {children}
    </Button>
  )
}

export default function Layout({ children }: { children: any }) {
  return (
    <Box>
      <Flex p='2' h='50px' align='center' bg='brand.yellow'>
        <Heading size='md' color='brand.gray'>
          Tidal UI
        </Heading>
      </Flex>
      <Flex>
        <Box
          p='2'
          w='200px'
          h='calc(100vh - 50px)'
          borderRightWidth='1px'
          borderRightStyle='solid'
          borderRightColor='gray.700'
        >
          <VStack>
            <SidebarButton to='/'>Home</SidebarButton>
            <SidebarButton to='/jobs'>Jobs</SidebarButton>
            <SidebarButton to='/presets'>presets</SidebarButton>
            <SidebarButton to='/settings'>settings</SidebarButton>
          </VStack>
        </Box>
        <Box p='2'>{children}</Box>
      </Flex>
    </Box>
  )
}
