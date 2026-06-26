import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useApp } from '../context/AppContext'
import { AlertCircle, CheckCircle, Send, MessageCircle, Bell, RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const TIPO_CONFIG = {
  respuesta_historial: {
    label: 'Requiere atención',
    color: '#F97316',
    bg: 'rgba(249,115,22,0.1)',
    icon: AlertCircle,
  },
  venta_confirmada: {
    label: 'Venta confirmada',
    color: '#5FBFF9',
    bg: 'rgba(95,191,249,0.1)',
    icon: CheckCircle,
  },
  pulse_enviado: {
    label: 'Pulse Check enviado',
    color: '#7B58F8',
    bg: 'rgba(123,88,248,0.1)',
    icon: Send,
  },
  partner_respondio: {
    label: 'Partner respondió',
    color: '#F5B942',
    bg: 'rgba(245,185,66,0.1)',
    icon: MessageCircle,
  },
}

const KNOWN_TYPES = Object.keys(TIPO_CONFIG)

const FILTER_TABS = [
  { key: 'todas',              label: 'Todas'              },
  { key: 'no_leidas',          label: 'Sin leer'           },
  { key: 'pulse_enviado',      label: 'Pulse enviado'      },
  { key: 'partner_respondio',  label: 'Partner respondió'  },
  { key: 'venta_confirmada',   label: 'Venta confirmada'   },
  { key: 'respuesta_historial', label: 'Historial'         },
]

function timeAgo(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24))
  if (diff <= 0) return 'Hoy'
  if (diff === 1) return 'Ayer'
  return `Hace ${diff} días`
}

export default function NotificationCenter() {
  const { notificaciones, marcarLeida, marcarTodasLeidas, setSelectedOportunidad, oportunidades, reactivarDesdeHistorial } = useApp()
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('todas')
  const [toastMsg, setToastMsg] = useState(null)
  const [confirmReactivar, setConfirmReactivar] = useState(null)

  const unread = notificaciones.filter(n => !n.leida).length

  const sorted = [...notificaciones]
    .filter(n => KNOWN_TYPES.includes(n.tipo))
    .sort((a, b) => {
      if (a.tipo === 'respuesta_historial' && b.tipo !== 'respuesta_historial') return -1
      if (a.tipo !== 'respuesta_historial' && b.tipo === 'respuesta_historial') return 1
      return new Date(b.fecha) - new Date(a.fecha)
    })

  const filtered = activeFilter === 'todas'
    ? sorted
    : activeFilter === 'no_leidas'
      ? sorted.filter(n => !n.leida)
      : sorted.filter(n => n.tipo === activeFilter)

  const attentionNotifs = filtered.filter(n => n.tipo === 'respuesta_historial')
  const regularNotifs   = filtered.filter(n => n.tipo !== 'respuesta_historial')

  function handleNotifClick(notif) {
    marcarLeida(notif.id)
    if (notif.oportunidadId) {
      const op = oportunidades.find(o => o.id === notif.oportunidadId)
      if (op) {
        setSelectedOportunidad(op)
        navigate(`/oportunidad/${notif.oportunidadId}`)
      }
    }
  }

  function handleReactivar(notif) {
    const op = oportunidades.find(o => o.id === notif.oportunidadId)
    if (op) setConfirmReactivar({ notif, op })
  }

  function confirmDoReactivar() {
    if (!confirmReactivar) return
    reactivarDesdeHistorial(confirmReactivar.op.id)
    marcarLeida(confirmReactivar.notif.id)
    setConfirmReactivar(null)
    setToastMsg('Oportunidad reactivada y de vuelta en el pipeline')
    setTimeout(() => setToastMsg(null), 3000)
  }

  function renderAttentionRow(notif, index, arr) {
    const cfg = TIPO_CONFIG[notif.tipo]
    const Icon = cfg.icon
    const op = oportunidades.find(o => o.id === notif.oportunidadId)

    return (
      <div key={notif.id}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
            padding: '18px 20px',
            background: notif.leida ? 'transparent' : 'rgba(249,115,22,0.04)',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onClick={() => handleNotifClick(notif)}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.07)' }}
          onMouseLeave={e => { e.currentTarget.style.background = notif.leida ? 'transparent' : 'rgba(249,115,22,0.04)' }}
        >
          {/* Icon */}
          <div style={{
            width: 36, height: 36,
            borderRadius: 8,
            background: cfg.bg,
            border: '1px solid rgba(249,115,22,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 8px rgba(249,115,22,0.15)',
          }}>
            <Icon size={16} color={cfg.color} strokeWidth={1.5} />
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#F5F7F7',
              margin: '0 0 4px',
              lineHeight: 1.3,
              fontFamily: 'DM Sans, sans-serif',
            }}>
              {notif.titulo}
            </p>
            <p style={{
              fontSize: 12,
              color: '#6F7876',
              margin: '0 0 12px',
              fontFamily: 'DM Sans, sans-serif',
              lineHeight: 1.5,
            }}>
              {notif.descripcion}
            </p>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
              <button
                onClick={() => handleNotifClick(notif)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'transparent',
                  color: '#A3AEAC',
                  fontSize: 12,
                  fontFamily: 'DM Sans, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#F5F7F7'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#A3AEAC'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
              >
                Ver en historial
              </button>
              <button
                onClick={() => handleReactivar(notif)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: 'none',
                  background: '#B0FF92',
                  color: '#121716',
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'DM Sans, sans-serif',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.88' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              >
                <RotateCcw size={11} strokeWidth={2.5} />
                Reactivar
              </button>
            </div>
          </div>

          {/* Unread dot */}
          <div style={{ width: 16, display: 'flex', justifyContent: 'center', flexShrink: 0, paddingTop: 2 }}>
            {!notif.leida && (
              <div style={{
                width: 7, height: 7,
                borderRadius: '50%',
                background: '#F97316',
                boxShadow: '0 0 6px rgba(249,115,22,0.6)',
              }} />
            )}
          </div>
        </div>

        {index < arr.length - 1 && (
          <div style={{ height: 1, background: 'rgba(249,115,22,0.08)', margin: '0 20px' }} />
        )}
      </div>
    )
  }

  function renderRegularRow(notif, index, arr) {
    const cfg = TIPO_CONFIG[notif.tipo]
    const op = oportunidades.find(o => o.id === notif.oportunidadId)
    const Icon = cfg.icon
    const secondary = [op?.partner, cfg.label, timeAgo(notif.fecha)].filter(Boolean).join(' · ')

    return (
      <div key={notif.id}>
        <div
          onClick={() => handleNotifClick(notif)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '16px 20px',
            background: notif.leida ? 'transparent' : 'rgba(255,255,255,0.05)',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
          onMouseLeave={e => { e.currentTarget.style.background = notif.leida ? 'transparent' : 'rgba(255,255,255,0.05)' }}
        >
          <div style={{
            width: 36, height: 36,
            borderRadius: 8,
            background: cfg.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon size={16} color={cfg.color} strokeWidth={1.5} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: 15,
              fontWeight: 500,
              color: '#F5F7F7',
              margin: '0 0 3px',
              lineHeight: 1.3,
              fontFamily: 'DM Sans, sans-serif',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {notif.titulo}
            </p>
            <p style={{
              fontSize: 12,
              color: '#6F7876',
              margin: 0,
              fontFamily: 'DM Sans, sans-serif',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {secondary}
            </p>
          </div>

          <div style={{ width: 16, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
            {!notif.leida && (
              <div style={{
                width: 7, height: 7,
                borderRadius: '50%',
                background: '#B0FF92',
                boxShadow: '0 0 6px rgba(176,255,146,0.5)',
              }} />
            )}
          </div>
        </div>

        {index < arr.length - 1 && (
          <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '0 20px' }} />
        )}
      </div>
    )
  }

  const isEmpty = attentionNotifs.length === 0 && regularNotifs.length === 0

  return (
    <div style={{ padding: '88px 40px 64px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 300, fontSize: 48, color: '#F5F7F7', margin: '0 0 8px', letterSpacing: '-0.03em', lineHeight: 1 }}>
            Notificaciones
          </h1>
          <p style={{ fontSize: 14, color: '#A3AEAC', margin: '0 0 24px', fontFamily: 'DM Sans, sans-serif' }}>
            Todo lo que pasó — sin que tengas que buscarlo.
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={marcarTodasLeidas}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              color: '#A3AEAC',
              fontSize: 13,
              padding: '8px 14px',
              cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              transition: 'all 0.15s',
              marginTop: 6,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
              e.currentTarget.style.color = '#F5F7F7'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              e.currentTarget.style.color = '#A3AEAC'
            }}
          >
            Marcar todo como leído
          </button>
        )}
      </div>
      <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)', marginBottom: 32 }} />

      {/* Filter tabs */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          display: 'inline-flex',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 8,
          padding: 4,
          gap: 2,
        }}>
          {FILTER_TABS.map(tab => {
            const isActive = activeFilter === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 6,
                  border: 'none',
                  background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                  color: isActive ? '#F5F7F7' : '#A3AEAC',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
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
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Notification list */}
      {isEmpty ? (
        <div style={{
          textAlign: 'center',
          padding: '64px 32px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 16,
        }}>
          <Bell size={32} color="#6F7876" strokeWidth={1} style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 15, color: '#A3AEAC', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
            No hay notificaciones
          </p>
          <p style={{ fontSize: 13, color: '#6F7876', margin: '6px 0 0', fontFamily: 'DM Sans, sans-serif' }}>
            Todo el pipeline está bajo control.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Requiere atención section */}
          {attentionNotifs.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <AlertCircle size={13} color="#F97316" strokeWidth={2} />
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#F97316',
                  fontFamily: 'DM Sans, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}>
                  Requiere atención
                </span>
              </div>
              <div style={{
                background: 'rgba(249,115,22,0.04)',
                border: '1px solid rgba(249,115,22,0.15)',
                borderRadius: 12,
                overflow: 'hidden',
              }}>
                {attentionNotifs.map((notif, index) =>
                  renderAttentionRow(notif, index, attentionNotifs)
                )}
              </div>
            </div>
          )}

          {/* Regular notifications */}
          {regularNotifs.length > 0 && (
            <div>
              {attentionNotifs.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#6F7876',
                    fontFamily: 'DM Sans, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}>
                    Resto de notificaciones
                  </span>
                </div>
              )}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12,
                overflow: 'hidden',
              }}>
                {regularNotifs.map((notif, index) =>
                  renderRegularRow(notif, index, regularNotifs)
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Reactivar confirmation modal */}
      {confirmReactivar && createPortal(
        <div
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setConfirmReactivar(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative', zIndex: 100000,
              width: '480px',
              background: 'rgba(18,23,22,0.97)',
              backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px', padding: '32px',
            }}
          >
            <h3 className="font-clash" style={{ fontSize: 18, fontWeight: 700, color: '#F5F7F7', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              ¿Reactivar esta oportunidad?
            </h3>
            <p style={{ fontSize: 14, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', margin: '0 0 6px', lineHeight: 1.5 }}>
              <span style={{ color: '#A3AEAC', fontWeight: 500 }}>{confirmReactivar.op.nombre}</span>
            </p>
            <p style={{ fontSize: 13, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', margin: '0 0 24px', lineHeight: 1.5 }}>
              Volverá al pipeline como{' '}
              <span style={{ color: '#B0FF92', fontWeight: 500 }}>
                {confirmReactivar.op.previousStatus
                  ? (confirmReactivar.op.previousStatus.charAt(0).toUpperCase() + confirmReactivar.op.previousStatus.slice(1).replace(/_/g, ' '))
                  : 'Respondida'}
              </span>
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmReactivar(null)}
                style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#A3AEAC', fontSize: 13, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#F5F7F7'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#A3AEAC'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDoReactivar}
                style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: '#B0FF92', color: '#121716', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', transition: 'opacity 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.88' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              >
                Reactivar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 32, right: 40, zIndex: 9995,
          background: 'rgba(18,23,22,0.96)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(176,255,146,0.2)',
          borderRadius: 10, padding: '12px 18px',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(176,255,146,0.06)',
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#B0FF92', boxShadow: '0 0 8px rgba(176,255,146,0.6)', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#F5F7F7', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
            {toastMsg}
          </span>
        </div>
      )}
    </div>
  )
}
