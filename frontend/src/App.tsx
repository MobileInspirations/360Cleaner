import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import ContactsPage from './pages/ContactsPage'
import { Toaster } from 'sonner'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/contacts" element={<ContactsPage />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  )
}

export default App 