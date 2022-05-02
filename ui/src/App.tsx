import React, { useState } from 'react'
import Home from './components/Home'
import Queues from './components/Queues'
import Layout from './components/Layout'
import Presets from './components/Presets'
import Settings from './components/Settings'

import { Route, Routes } from 'react-router-dom'
import { Button, Flex, Heading, Input } from '@chakra-ui/react'
import Renditions from './components/Renditions'

export function App() {
  const localStorageKey = localStorage.getItem('apiKey') || ''
  const [apiKey, setApiKey] = useState(localStorageKey)

  function handleChange(e: any) {
    setApiKey(e.target.value)
  }

  function handleSubmit() {
    localStorage.setItem('apiKey', apiKey || '')
    window.location.reload()
    // TODO :: Make request to api to see if api key is valid
  }

  if (!localStorageKey) {
    return (
      <Layout>
        <Flex direction='column' maxW='500px'>
          <Heading size='md'> Please Set Your API Key </Heading>
          <Flex mt='2' align='start'>
            <Input onChange={handleChange} defaultValue={apiKey} placeholder='API Key' />
            <Button onClick={handleSubmit} colorScheme='yellow' ml='2'>
              Set
            </Button>
          </Flex>
        </Flex>
      </Layout>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/queues' element={<Queues />} />
        <Route path='/presets' element={<Presets />} />
        <Route path='/settings' element={<Settings />} />
        <Route path='/renditions' element={<Renditions />} />
      </Routes>
    </Layout>
  )
}
