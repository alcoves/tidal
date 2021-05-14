import { Flex } from '@chakra-ui/layout';
import SideNav from './SideNav';

function Content({ children }) {
  return <div>{children}</div>;
}

const Layout = ({ children }) => (
  <Flex flexDirection='row'>
    <SideNav />
    <Content>
      {children}
    </Content>
  </Flex>
);

export default Layout;