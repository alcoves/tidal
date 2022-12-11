import Layout from './Layout'
import AddJob from './AddJob'
import Queue from './Queues/Queue'
import Queues from './Queues/Queues'
import TokenSettings from './Tokens'
import VideoAssets from './VideoAssets'
import NoMatchRoute from './NoMatchRoute'
import VideoAsset from './VideoAsset/VideoAsset'
import { Routes, Route } from 'react-router-dom'
import Job from './Queues/Job'
import Workflows from './Workflows/Workflows'

function App() {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route path='workflows' element={<Workflows />} />
        <Route path='assets/videos' element={<VideoAssets />} />
        <Route path='assets/videos/:videoId' element={<VideoAsset />} />
        <Route path='queues' element={<Queues />} />
        <Route path='queues/add' element={<AddJob />} />
        <Route path='queues/:queueName' element={<Queue />} />
        <Route path='queues/:queueName/jobs/:jobId' element={<Job />} />
        <Route path='settings/tokens' element={<TokenSettings />} />
        <Route path='*' element={<NoMatchRoute />} />
      </Route>
    </Routes>
  )
}

export default App
