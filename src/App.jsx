import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Sidebar from './components/Sidebar'
import PipelineBoard from './components/Pipeline/PipelineBoard'
import NotificationCenter from './components/NotificationCenter'
import ImportScreen from './components/ImportScreen'
import OpportunityDetail from './components/OpportunityDetail'
import ProfilePage from './pages/ProfilePage'
import PartnersPage from './pages/PartnersPage'
import PulseCheckPage from './pages/PulseCheckPage'
import NuevasPage from './pages/NuevasPage'
import NotificationsPage from './pages/NotificationsPage'
import LandingPage from './pages/LandingPage'
import { useState, useEffect } from 'react'

function AppContent({ isCollapsed, setIsCollapsed }) {
  const location = useLocation()
  const isLanding = location.pathname === '/'

  return (
    <>
      {isLanding ? (
        <Routes>
          <Route path="/" element={<LandingPage />} />
        </Routes>
      ) : (
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
            overflowX: 'visible',
            position: 'relative',
            zIndex: 1,
            height: '100vh',
            transition: 'margin-left 0.25s ease, width 0.25s ease',
          }}>
            <Routes>
              <Route path="/pipeline" element={<PipelineBoard />} />
              <Route path="/nuevas" element={<NuevasPage />} />
              <Route path="/notificaciones" element={<NotificationsPage />} />
              <Route path="/notificaciones-centro" element={<NotificationCenter />} />
              <Route path="/importar" element={<ImportScreen />} />
              <Route path="/oportunidad/:id" element={<OpportunityDetail isSidebarCollapsed={isCollapsed} />} />
              <Route path="/opportunity/:id/pulse-check" element={<PulseCheckPage />} />
              <Route path="/partners" element={<PartnersPage />} />
              <Route path="/perfil" element={<ProfilePage />} />
            </Routes>
          </main>
        </div>
      )}
    </>
  )
}

export default function App() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <AppProvider>
      <BrowserRouter>
        {windowWidth < 1280 && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100vw',
            height: '100vh',
            background: '#121716',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'transparent',
              boxShadow: '0 0 0 1px rgba(176,255,146,0.9), 0 0 8px 4px rgba(176,255,146,0.5), 0 0 20px 8px rgba(176,255,146,0.2)',
              marginBottom: '24px'
            }}/>
            <p style={{
              fontFamily: 'Satoshi',
              fontWeight: 700,
              fontSize: '24px',
              color: '#F5F7F7',
              margin: '0 0 8px'
            }}>Beacon</p>
            <p style={{
              fontFamily: 'DM Sans',
              fontSize: '13px',
              color: '#6F7876',
              margin: '0 0 24px'
            }}>Cada deal, bajo control</p>
            <div style={{
              width: '40px',
              height: '1px',
              background: 'rgba(255,255,255,0.1)',
              marginBottom: '24px'
            }}/>
            <p style={{
              fontFamily: 'Satoshi',
              fontWeight: 300,
              fontSize: '20px',
              color: '#F5F7F7',
              margin: '0 0 12px',
              lineHeight: 1.3
            }}>
              Beacon está optimizado para desktop
            </p>
            <p style={{
              fontFamily: 'DM Sans',
              fontSize: '14px',
              color: '#A3AEAC',
              margin: 0,
              lineHeight: 1.6,
              maxWidth: '280px'
            }}>
              Para la mejor experiencia abre Beacon
              desde tu computador.
            </p>
          </div>
        )}
        <AppContent isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </BrowserRouter>
    </AppProvider>
  )
}
