import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import { Settings as SettingsIcon, LayoutDashboard } from 'lucide-react'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <nav className="border-b">
            <div className="container mx-auto px-4 py-3 flex gap-6">
              <Link
                to="/"
                className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                to="/settings"
                className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
              >
                <SettingsIcon className="h-4 w-4" />
                Settings
              </Link>
            </div>
          </nav>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
