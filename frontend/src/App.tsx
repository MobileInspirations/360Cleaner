import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import ContactsPage from './pages/ContactsPage'
import TagsView from './pages/TagsView'
import { Toaster } from 'sonner'
import SiteHeader from './components/SiteHeader'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/tags" element={<TagsView />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  )
}

export default App 