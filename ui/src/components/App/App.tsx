import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { Routes, Route, Outlet, Link } from "react-router-dom";

function App() {
  return (
    <Box h='calc(100vh - 50px)' w='100vw'>
      <Flex borderBottom='solid grey 1px' justify='space-between' h='50px' bg='gray.50'>
        <Flex w='200px' align='center' pl='2'>
          <Heading size='md'>Tidal</Heading>
        </Flex>
        <Flex align='center' pr='2'>
          set token button
        </Flex>
      </Flex>
      <Flex w='100%' h='100%'>
      <Box borderRight='solid grey 1px' w='200px' h='100%' bg='gray.50'>
        <Flex cursor='pointer' w='100%' h='30px' align='center' pl='4'>
          <Text>
            <Link to="/">Home</Link>
          </Text>
        </Flex>
        <Flex cursor='pointer' w='100%' h='30px' align='center' pl='4'>
          <Text>
            <Link to="/jobs">Jobs</Link>
          </Text>
        </Flex>
      </Box>
      <Box w='100%' p='4'>

      <Routes>
        <Route index element={<Home />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="*" element={<NoMatch />} />
      </Routes>

      <Outlet />
      </Box>
      </Flex>
    </Box>
  );
}

function Home() {
  return (
    <div>
      <h2>Home</h2>
    </div>
  );
}

function Jobs() {
  return (
    <div>
      <h2>Jobs</h2>
    </div>
  );
}

function NoMatch() {
  return (
    <div>
      <h2>Nothing to see here!</h2>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </div>
  );
}

export default App;
