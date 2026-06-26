import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Sidebar from './components/Sidebar'
import PipelineBoard from './components/Pipeline/PipelineBoard'
import NotificationCenter from './components/NotificationCenter'
import ImportScreen from './components/ImportScreen'
import OpportunityDetail from './components/OpportunityDetail'
import ProfilePage from './pages/ProfilePage'
import PartnersPage from './pages/PartnersPage'
import PulseCheckPage from './pages/PulseCheckPage'
import { useState } from 'react'

export default function App() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <AppProvider>
      <BrowserRouter>
        <div style={{
          display: 'flex',
          height: '100vh',
          width: '100%',
          minWidth: 1280,
          background: '#121716',
          position: 'relative',
        }}>
          <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

          <main style={{
            marginLeft: isCollapsed ? '64px' : '240px',
            width: isCollapsed ? 'calc(100% - 64px)' : 'calc(100% - 240px)',
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            position: 'relative',
            zIndex: 1,
            height: '100vh',
            transition: 'margin-left 0.25s ease, width 0.25s ease',
          }}>
        <Routes>
          <Route path="/" element={<PipelineBoard />} />
          <Route path="/notificaciones" element={<NotificationCenter />} />
          <Route path="/importar" element={<ImportScreen />} />
          <Route path="/oportunidad/:id" element={<OpportunityDetail isSidebarCollapsed={isCollapsed} />} />
          <Route path="/opportunity/:id/pulse-check" element={<PulseCheckPage />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
        </Routes>
      </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  )
}
