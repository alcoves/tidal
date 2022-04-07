import Home from './components/Home'
import Queues from './components/Queues'
import Layout from './components/Layout'
import Presets from './components/Presets'
import Settings from './components/Settings'

import { Route, Routes } from 'react-router-dom'

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/queues' element={<Queues />} />
        <Route path='/presets' element={<Presets />} />
        <Route path='/settings' element={<Settings />} />
      </Routes>
    </Layout>
  )
}
