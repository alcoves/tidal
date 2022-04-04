import Home from './components/Home'
import Jobs from './components/Jobs'
import Layout from './components/Layout'
import Presets from './components/Presets'
import Settings from './components/Settings'

import { Route, Routes } from 'react-router-dom'

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/jobs' element={<Jobs />} />
        <Route path='/presets' element={<Presets />} />
        <Route path='/settings' element={<Settings />} />
      </Routes>
    </Layout>
  )
}
