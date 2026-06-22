import { NavLink, Link, useLocation } from 'react-router-dom'
import { LayoutGrid, Bell, Upload, Users } from 'lucide-react'
import { useApp } from '../context/AppContext'

const navItems = [
  { path: '/', label: 'Pipeline', icon: LayoutGrid },
  { path: '/partners', label: 'Partners', icon: Users },
  { path: '/notificaciones', label: 'Notificaciones', icon: Bell },
  { path: '/importar', label: 'Importar', icon: Upload },
]

export default function Sidebar() {
  const location = useLocation()
  const { unreadCount } = useApp()

  return (
    <aside
      className="glass-sidebar flex flex-col"
      style={{ width: 240, minWidth: 240, height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 40 }}
    >
      {/* Logo */}
      <div style={{ padding: '28px 24px 0' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', cursor: 'pointer' }}>
          <BeaconLogo />
          <span style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700, fontSize: 20, color: '#F5F7F7', letterSpacing: '0.02em' }}>Beacon</span>
        </Link>
        <p style={{ fontSize: 13, color: '#6F7876', marginTop: 12, letterSpacing: '0.02em' }}>
          Cada deal, bajo control
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '16px 16px 0' }} />

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(path)

          return (
            <NavLink
              key={path}
              to={path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 8,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                background: isActive ? 'rgba(176,255,146,0.08)' : 'transparent',
                color: isActive ? '#B0FF92' : '#A3AEAC',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 14,
                fontWeight: isActive ? 500 : 400,
                border: isActive ? '1px solid rgba(176,255,146,0.12)' : '1px solid transparent',
                position: 'relative',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.color = '#F5F7F7'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#A3AEAC'
                }
              }}
            >
              <Icon size={16} strokeWidth={1.5} />
              <span style={{ flex: 1 }}>{label}</span>
              {path === '/notificaciones' && unreadCount > 0 && (
                <span style={{
                  color: '#B0FF92',
                  fontSize: 12,
                  fontWeight: 500,
                  fontFamily: 'DM Sans, sans-serif',
                }}>
                  {unreadCount}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 12 }}>
        <NavLink
          to="/perfil"
          style={{ textDecoration: 'none', display: 'block' }}
        >
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s ease', background: 'transparent' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(176,255,146,0.3) 0%, rgba(88,99,248,0.3) 100%)',
              border: '1px solid rgba(176,255,146,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 600, color: '#B0FF92', flexShrink: 0,
            }}>
              C
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#F5F7F7', margin: 0 }}>Carlos</p>
              <p style={{ fontSize: 11, color: '#6F7876', margin: 0 }}>Channel Manager</p>
            </div>
          </div>
        </NavLink>
      </div>
    </aside>
  )
}


function BeaconLogo() {
  return (
    <div style={{
      width: 28,
      height: 28,
      borderRadius: '50%',
      background: 'transparent',
      flexShrink: 0,
      boxShadow: [
        '0 0 0 1px rgba(176, 255, 146, 0.9)',
        '0 0 8px 4px rgba(176, 255, 146, 0.5)',
        '0 0 20px 8px rgba(176, 255, 146, 0.2)',
        '0 0 40px 16px rgba(176, 255, 146, 0.08)',
      ].join(', '),
    }} />
  )
}
