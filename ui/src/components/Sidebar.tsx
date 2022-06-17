import { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { IconType } from 'react-icons/lib'
import { Button, Box, VStack } from '@chakra-ui/react'
import { IoAlbums, IoCodeSlash, IoFilm, IoHome, IoSettings } from 'react-icons/io5'

function SidebarButton({
  to,
  icon,
  children,
}: {
  to: string
  icon: ReactElement<IconType>
  children: React.ReactNode
}) {
  return (
    <Button as={Link} leftIcon={icon} to={to} w='100%' justifyContent='start'>
      {children}
    </Button>
  )
}

export default function Sidebar() {
  return (
    <Box
      p='2'
      w='200px'
      minW='200px'
      h='calc(100vh - 50px)'
      borderRightWidth='1px'
      borderRightStyle='solid'
      borderRightColor='gray.700'
    >
      <VStack>
        <SidebarButton to='/' icon={<IoHome />}>
          Home
        </SidebarButton>
        <SidebarButton to='/workflows' icon={<IoCodeSlash />}>
          Workflows
        </SidebarButton>
        <SidebarButton to='/settings' icon={<IoSettings />}>
          Settings
        </SidebarButton>
      </VStack>
    </Box>
  )
}
