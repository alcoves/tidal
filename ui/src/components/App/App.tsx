import Layout from '../Layout'
import Jobs from '../Jobs/Jobs'
import AddJob from '../AddJob/AddJob'
import NoMatchRoute from '../NoMatchRoute'
import TokenSettings from '../Settings/Tokens'
import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route path='jobs' element={<Jobs />} />
        <Route path='jobs/add' element={<AddJob />} />
        <Route path='settings/tokens' element={<TokenSettings />} />
        <Route path='*' element={<NoMatchRoute />} />
      </Route>
    </Routes>
  )
}

export default App
