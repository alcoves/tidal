import Layout from './Layout'
import Jobs from './Jobs'
import AddJob from './AddJob'
import TokenSettings from './Tokens'
import VideoAsset from './VideoAsset/VideoAsset'
import VideoAssets from './VideoAssets'
import NoMatchRoute from './NoMatchRoute'
import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route path='assets/videos' element={<VideoAssets />} />
        <Route path='assets/videos/:videoId' element={<VideoAsset />} />
        <Route path='jobs' element={<Jobs />} />
        <Route path='jobs/add' element={<AddJob />} />
        <Route path='settings/tokens' element={<TokenSettings />} />
        <Route path='*' element={<NoMatchRoute />} />
      </Route>
    </Routes>
  )
}

export default App
