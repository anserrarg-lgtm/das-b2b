import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Sidebar from './components/Sidebar'
import PipelineBoard from './components/Pipeline/PipelineBoard'
import NotificationCenter from './components/NotificationCenter'
import ImportScreen from './components/ImportScreen'
import OpportunityDetail from './components/OpportunityDetail'
import ProfilePage from './pages/ProfilePage'
import PartnersPage from './pages/PartnersPage'

export default function App() {
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
          <Sidebar />

          <main style={{
            marginLeft: 240,
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            position: 'relative',
            zIndex: 1,
            height: '100vh',
          }}>
            <Routes>
              <Route path="/" element={<PipelineBoard />} />
              <Route path="/notificaciones" element={<NotificationCenter />} />
              <Route path="/importar" element={<ImportScreen />} />
              <Route path="/oportunidad/:id" element={<OpportunityDetail />} />
              <Route path="/partners" element={<PartnersPage />} />
              <Route path="/perfil" element={<ProfilePage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  )
}
