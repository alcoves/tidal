import { Box, Flex } from '@chakra-ui/layout';
import SideNav from './SideNav';

const Layout = ({ children }) => (
  <Flex flexDirection='row' mt='20px'>
    <SideNav />
    <Box>{children}</Box>
  </Flex>
);

export default Layout;