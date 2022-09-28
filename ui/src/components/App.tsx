import Layout from './Layout'
import Jobs from './Jobs'
import AddJob from './AddJob'
import NoMatchRoute from './NoMatchRoute'
import TokenSettings from './Tokens'
import { Routes, Route } from 'react-router-dom'
import VideoAssets from './VideoAssets'

function App() {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route path='assets/videos' element={<VideoAssets />} />
        <Route path='jobs' element={<Jobs />} />
        <Route path='jobs/add' element={<AddJob />} />
        <Route path='settings/tokens' element={<TokenSettings />} />
        <Route path='*' element={<NoMatchRoute />} />
      </Route>
    </Routes>
  )
}

export default App
