import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutGrid, Bell, Upload, Users } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useState } from 'react'

const navItems = [
  { path: '/', label: 'Pipeline', icon: LayoutGrid },
  { path: '/partners', label: 'Partners', icon: Users },
  { path: '/notificaciones', label: 'Notificaciones', icon: Bell },
]

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { unreadCount } = useApp()
  const [hoveredNav, setHoveredNav] = useState(null)

  const sidebarWidth = isCollapsed ? 64 : 240

  return (
    <aside
      className="glass-sidebar flex flex-col"
      style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 40,
        transition: 'width 0.25s ease',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', width: '100%', padding: '16px' }}>
        {!isCollapsed && (
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', cursor: 'pointer' }}>
            <BeaconLogo />
            <span style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700, fontSize: 20, color: '#F5F7F7', letterSpacing: '0.02em' }}>Beacon</span>
          </Link>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#6F7876',
            flexShrink: 0,
            transition: 'all 0.2s ease',
            padding: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
            e.currentTarget.style.color = '#F5F7F7'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
            e.currentTarget.style.color = '#6F7876'
          }}
        >
          {isCollapsed ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color: 'currentColor' }}>
              <rect x="1.5" y="1.5" width="15" height="15" rx="4" stroke="currentColor" strokeWidth="1.8"/>
              <rect x="10.5" y="2.5" width="5" height="13" rx="3" fill="currentColor" opacity="0.9"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color: 'currentColor' }}>
              <rect x="1.5" y="1.5" width="15" height="15" rx="4" stroke="currentColor" strokeWidth="1.8"/>
              <rect x="2.5" y="2.5" width="5" height="13" rx="3" fill="currentColor" opacity="0.9"/>
            </svg>
          )}
        </button>
      </div>

      {/* Tagline */}
      {!isCollapsed && (
        <p style={{ fontSize: 13, color: '#6F7876', marginTop: -8, marginLeft: 16, marginRight: 16, marginBottom: 12, letterSpacing: '0.02em' }}>
          Cada deal, bajo control
        </p>
      )}

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '16px 16px 0' }} />

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(path)
          const isHovered = hoveredNav === path

          return (
            <div key={path} style={{ position: 'relative' }}>
              <NavLink
                to={path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  gap: isCollapsed ? 0 : 10,
                  padding: isCollapsed ? '9px 0' : '9px 12px',
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
                  setHoveredNav(path)
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                    e.currentTarget.style.color = '#F5F7F7'
                  }
                }}
                onMouseLeave={e => {
                  setHoveredNav(null)
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#A3AEAC'
                  }
                }}
              >
                <Icon size={16} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                {!isCollapsed && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    width: '100%'
                  }}>
                    <span>{label}</span>
                    {path === '/notificaciones' && unreadCount > 0 && (
                      <span style={{
                        color: '#B0FF92',
                        fontSize: 12,
                        fontWeight: 500,
                        fontFamily: 'DM Sans, sans-serif'
                      }}>
                        {unreadCount}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>

              {isCollapsed && isHovered && (
                <div style={{
                  position: 'absolute',
                  left: '100%',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  marginLeft: 8,
                  background: '#1E2524',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 4,
                  padding: '6px 10px',
                  fontSize: 12,
                  color: '#F5F7F7',
                  fontFamily: 'DM Sans, sans-serif',
                  whiteSpace: 'nowrap',
                  zIndex: 50,
                }}>
                  {label}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Ver demo button */}
      <div style={{ padding: '12px 12px 8px 12px' }}>
        <button
          onClick={() => navigate('/pipeline')}
          style={{
            width: '100%',
            background: '#B0FF92',
            color: '#121716',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 12px',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            opacity: isCollapsed ? 0 : 1,
            pointerEvents: isCollapsed ? 'none' : 'auto',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#A8EE7C'}
          onMouseLeave={e => e.currentTarget.style.background = '#B0FF92'}
        >
          Ver demo
        </button>
      </div>

      {/* User */}
      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 12 }}>
        <NavLink
          to="/perfil"
          style={{ textDecoration: 'none', display: 'block' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: isCollapsed ? 0 : 10,
              padding: isCollapsed ? '10px 0' : '10px 12px',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: 'transparent',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(176,255,146,0.3) 0%, rgba(88,99,248,0.3) 100%)',
              border: '1px solid rgba(176,255,146,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 600,
              color: '#B0FF92',
              flexShrink: 0,
            }}>
              C
            </div>
            {!isCollapsed && (
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#F5F7F7', margin: 0 }}>Carlos</p>
                <p style={{ fontSize: 11, color: '#6F7876', margin: 0 }}>Channel Manager</p>
              </div>
            )}
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
