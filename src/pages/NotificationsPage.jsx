import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useApp } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Copy, X, RotateCcw, CheckCircle, Send, PlayCircle } from 'lucide-react'

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
  if (diff === 1) return '1 día'
  return `${diff} días`
}

function getDaysSinceDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  return Math.floor((now - d) / (1000 * 60 * 60 * 24))
}

export default function NotificationsPage() {
  const { notificaciones, marcarLeida, marcarTodasLeidas, setSelectedOportunidad, oportunidades } = useApp()
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('todas')
  const [escalarModal, setEscalarModal] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  const TIPO_CONFIG = {
    respuesta_historial: {
      color: '#F97316',
      bg: 'rgba(249,115,22,0.1)',
    },
    sin_respuesta: {
      color: '#F97316',
      bg: 'rgba(249,115,22,0.1)',
    },
    venta_confirmada: {
      color: '#5FBFF9',
      bg: 'rgba(95,191,249,0.1)',
    },
    pulse_enviado: {
      color: '#7B58F8',
      bg: 'rgba(123,88,248,0.1)',
    },
    partner_respondio: {
      color: '#F5B942',
      bg: 'rgba(245,185,66,0.1)',
    },
    reactivada: {
      color: '#8B9BAD',
      bg: 'rgba(139,155,173,0.1)',
    },
  }

  const filtered = activeFilter === 'todas'
    ? notificaciones
    : activeFilter === 'no_leidas'
      ? notificaciones.filter(n => !n.leida)
      : notificaciones.filter(n => n.tipo === activeFilter)

  // Split notifications into two sections
  const requiereAtencion = filtered.filter(n => {
    if (n.tipo === 'respuesta_historial') return true
    if (n.tipo === 'sin_respuesta') {
      const daysSince = getDaysSinceDate(n.fecha)
      return daysSince >= 30
    }
    return false
  })

  const restoNotificaciones = filtered.filter(n => {
    if (n.tipo === 'respuesta_historial') return false
    if (n.tipo === 'sin_respuesta') {
      const daysSince = getDaysSinceDate(n.fecha)
      return daysSince < 30
    }
    return true
  })

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

  function openEscalarModal(notif) {
    const op = oportunidades.find(o => o.id === notif.oportunidadId)
    if (op) {
      const diasSinRespuesta = op.diasSinRespuesta || 0
      const pulseCount = op.pulseChecks?.length || 0
      const summary = `La oportunidad ${op.cliente} con el cliente ${op.cliente} lleva ${diasSinRespuesta} días sin respuesta por parte de ${op.partner}. Se han enviado ${pulseCount} Pulse Checks automáticos sin éxito. Se recomienda escalar para definir si el partner puede continuar trabajando este deal o si se debe reasignar a otro canal.`
      setEscalarModal({ notif, op, summary, diasSinRespuesta })
    }
  }

  function handleCopyResumen(text, id) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div style={{
      padding: '88px 40px 64px',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      {/* Header */}
      <h1 style={{
        fontFamily: 'Satoshi, sans-serif',
        fontSize: 48,
        fontWeight: 300,
        color: '#F5F7F7',
        margin: '0 0 8px',
        letterSpacing: '-0.02em',
      }}>
        Notificaciones
      </h1>
      <p style={{
        fontSize: 14,
        color: '#6F7876',
        margin: '0 0 24px',
        fontFamily: 'DM Sans, sans-serif',
      }}>
        Todo lo que pasó — sin que tengas que buscarlo.
      </p>

      {/* Divider */}
      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        marginBottom: 32,
      }} />

      {/* Filter bar and button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        gap: 20,
      }}>
        {/* Filter pills */}
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
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#F5F7F7' } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#A3AEAC' } }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <button
          onClick={marcarTodasLeidas}
          style={{
            padding: '6px 16px',
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent',
            color: '#A3AEAC',
            fontSize: 13,
            fontFamily: 'DM Sans, sans-serif',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#F5F7F7'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#A3AEAC'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
        >
          Marcar todo como leído
        </button>
      </div>

      {/* Notifications sections */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#6F7876',
        }}>
          <p>No hay notificaciones para mostrar</p>
        </div>
      ) : (
        <>
          {/* REQUIERE ATENCIÓN Section */}
          {requiereAtencion.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 16,
              }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#F97316',
                  background: 'rgba(249,115,22,0.1)',
                  border: '1px solid rgba(249,115,22,0.2)',
                  padding: '3px 8px',
                  borderRadius: 4,
                  fontFamily: 'DM Sans, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  REQUIERE ATENCIÓN
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {requiereAtencion.map(notif => {
                    const cfg = TIPO_CONFIG[notif.tipo] || TIPO_CONFIG.pulse_enviado
                    const showActionButtons = notif.tipo === 'respuesta_historial' ||
                      (notif.tipo === 'sin_respuesta' && getDaysSinceDate(notif.fecha) >= 30)

                    return (
                      <div key={notif.id} style={{
                        borderRadius: 12,
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(255,255,255,0.04)',
                        padding: '16px 20px',
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 14,
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                        }}
                        onClick={() => handleNotifClick(notif)}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                        >
                        {/* Icon */}
                        {notif.tipo === 'venta_confirmada' ? (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(95,191,249,0.1)',
                            borderRadius: 8,
                            padding: 8,
                            flexShrink: 0,
                          }}>
                            <CheckCircle size={18} color="#5FBFF9" strokeWidth={1.5} />
                          </div>
                        ) : notif.tipo === 'pulse_enviado' ? (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(123,88,248,0.1)',
                            borderRadius: 8,
                            padding: 8,
                            flexShrink: 0,
                          }}>
                            <Send size={18} color="#7B58F8" strokeWidth={1.5} />
                          </div>
                        ) : notif.tipo === 'reactivada' ? (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(139,155,173,0.1)',
                            borderRadius: 8,
                            padding: 8,
                            flexShrink: 0,
                          }}>
                            <PlayCircle size={18} color="#8B9BAD" strokeWidth={1.5} />
                          </div>
                        ) : (
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            background: cfg.bg,
                            border: `1px solid ${cfg.color}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <AlertCircle size={14} color={cfg.color} strokeWidth={1.5} />
                          </div>
                        )}

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#F5F7F7',
                            margin: '0 0 4px',
                            fontFamily: 'DM Sans, sans-serif',
                          }}>
                            {notif.titulo}
                          </p>
                          <p style={{
                            fontSize: 12,
                            color: '#A3AEAC',
                            margin: '0 0 8px',
                            fontFamily: 'DM Sans, sans-serif',
                            lineHeight: 1.5,
                          }}>
                            {notif.descripcion}
                          </p>

                          {/* Action buttons */}
                          {showActionButtons && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px', width: '100%' }} onClick={e => e.stopPropagation()}>
                              {notif.tipo === 'respuesta_historial' ? (
                                <>
                                  <button
                                    onClick={() => handleNotifClick(notif)}
                                    style={{
                                      padding: '6px 14px',
                                      borderRadius: 6,
                                      border: '1px solid rgba(255,255,255,0.1)',
                                      background: 'transparent',
                                      color: '#A3AEAC',
                                      fontSize: 13,
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
                                    onClick={e => { e.stopPropagation(); handleNotifClick(notif) }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      padding: '6px 14px',
                                      borderRadius: 6,
                                      border: 'none',
                                      background: '#B0FF92',
                                      color: '#121716',
                                      fontSize: 13,
                                      fontWeight: 600,
                                      fontFamily: 'DM Sans, sans-serif',
                                      cursor: 'pointer',
                                      transition: 'opacity 0.15s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.88' }}
                                    onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                                  >
                                    <RotateCcw size={13} strokeWidth={2} />
                                    Reactivar
                                  </button>
                                </>
                              ) : notif.tipo === 'sin_respuesta' && getDaysSinceDate(notif.fecha) >= 30 ? (
                                <>
                                  <button
                                    onClick={() => handleNotifClick(notif)}
                                    style={{
                                      padding: '6px 14px',
                                      borderRadius: 6,
                                      border: '1px solid rgba(255,255,255,0.1)',
                                      background: 'transparent',
                                      color: '#A3AEAC',
                                      fontSize: 13,
                                      fontFamily: 'DM Sans, sans-serif',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#F5F7F7' }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#A3AEAC' }}
                                  >
                                    Poner en espera
                                  </button>

                                  <button
                                    onClick={() => handleNotifClick(notif)}
                                    style={{
                                      padding: '6px 14px',
                                      borderRadius: 6,
                                      border: 'none',
                                      background: '#B0FF92',
                                      color: '#121716',
                                      fontSize: 13,
                                      fontFamily: 'DM Sans, sans-serif',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s',
                                      fontWeight: 600,
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.88' }}
                                    onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                                  >
                                    Ver oportunidad
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleNotifClick(notif)}
                                    style={{
                                      padding: '4px 10px',
                                      borderRadius: 4,
                                      border: '1px solid rgba(255,255,255,0.1)',
                                      background: 'transparent',
                                      color: '#A3AEAC',
                                      fontSize: 11,
                                      fontFamily: 'DM Sans, sans-serif',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.color = '#F5F7F7'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                                    onMouseLeave={e => { e.currentTarget.style.color = '#A3AEAC'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                                  >
                                    Ver
                                  </button>

                                  <button
                                    onClick={() => handleNotifClick(notif)}
                                    style={{
                                      padding: '4px 10px',
                                      borderRadius: 4,
                                      border: '1px solid rgba(139,155,173,0.2)',
                                      background: 'transparent',
                                      color: '#8B9BAD',
                                      fontSize: 11,
                                      fontFamily: 'DM Sans, sans-serif',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,155,173,0.5)'; e.currentTarget.style.color = '#A3AEAC' }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(139,155,173,0.2)'; e.currentTarget.style.color = '#8B9BAD' }}
                                  >
                                    Espera
                                  </button>

                                  <button
                                    onClick={() => openEscalarModal(notif)}
                                    style={{
                                      padding: '4px 10px',
                                      borderRadius: 4,
                                      border: '1px solid rgba(249,115,22,0.2)',
                                      background: 'transparent',
                                      color: '#F97316',
                                      fontSize: 11,
                                      fontFamily: 'DM Sans, sans-serif',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.5)'; e.currentTarget.style.color = '#FF9F43' }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.2)'; e.currentTarget.style.color = '#F97316' }}
                                  >
                                    Escalar
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <p style={{
                            fontSize: 11,
                            color: '#6F7876',
                            margin: 0,
                            whiteSpace: 'nowrap',
                            fontFamily: 'DM Sans, sans-serif',
                          }}>
                            {timeAgo(notif.fecha)}
                          </p>

                          {/* Unread indicator dot */}
                          {!notif.leida && (
                            <div style={{
                              width: '5px',
                              height: '5px',
                              minWidth: '5px',
                              borderRadius: '50%',
                              background: '#B0FF92',
                              flexShrink: 0,
                              alignSelf: 'center',
                              boxShadow: '0 0 0 1px rgba(176,255,146,0.2), 0 0 4px 2px rgba(176,255,146,0.35), 0 0 8px 3px rgba(176,255,146,0.15)'
                            }} />
                          )}
                        </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

          {/* RESTO DE NOTIFICACIONES Section */}
          {restoNotificaciones.length > 0 && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 16,
              }}>
                <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#A3AEAC',
                    fontFamily: 'DM Sans, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>
                    RESTO DE NOTIFICACIONES
                  </span>
                </div>

                <div style={{
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.02)',
                  overflow: 'hidden',
                }}>
                  {restoNotificaciones.map((notif, index) => {
                    const cfg = TIPO_CONFIG[notif.tipo] || TIPO_CONFIG.pulse_enviado
                    const isLast = index === restoNotificaciones.length - 1

                    return (
                      <div key={notif.id} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 14,
                        padding: '16px 20px',
                        borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.06)',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onClick={() => handleNotifClick(notif)}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                      >
                        {/* Icon */}
                        {notif.tipo === 'venta_confirmada' ? (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(95,191,249,0.1)',
                            borderRadius: 8,
                            padding: 8,
                            flexShrink: 0,
                          }}>
                            <CheckCircle size={18} color="#5FBFF9" strokeWidth={1.5} />
                          </div>
                        ) : notif.tipo === 'pulse_enviado' ? (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(123,88,248,0.1)',
                            borderRadius: 8,
                            padding: 8,
                            flexShrink: 0,
                          }}>
                            <Send size={18} color="#7B58F8" strokeWidth={1.5} />
                          </div>
                        ) : notif.tipo === 'reactivada' ? (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(139,155,173,0.1)',
                            borderRadius: 8,
                            padding: 8,
                            flexShrink: 0,
                          }}>
                            <PlayCircle size={18} color="#8B9BAD" strokeWidth={1.5} />
                          </div>
                        ) : (
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            background: cfg.bg,
                            border: `1px solid ${cfg.color}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <AlertCircle size={14} color={cfg.color} strokeWidth={1.5} />
                          </div>
                        )}

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#F5F7F7',
                            margin: '0 0 4px',
                            fontFamily: 'DM Sans, sans-serif',
                          }}>
                            {notif.titulo}
                          </p>
                          <p style={{
                            fontSize: 12,
                            color: '#A3AEAC',
                            margin: 0,
                            fontFamily: 'DM Sans, sans-serif',
                            lineHeight: 1.5,
                          }}>
                            {notif.descripcion}
                          </p>
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <p style={{
                            fontSize: 11,
                            color: '#6F7876',
                            margin: 0,
                            whiteSpace: 'nowrap',
                            fontFamily: 'DM Sans, sans-serif',
                          }}>
                            {timeAgo(notif.fecha)}
                          </p>

                          {/* Unread indicator dot */}
                          {!notif.leida && (
                            <div style={{
                              width: '5px',
                              height: '5px',
                              minWidth: '5px',
                              borderRadius: '50%',
                              background: '#B0FF92',
                              flexShrink: 0,
                              alignSelf: 'center',
                              boxShadow: '0 0 0 1px rgba(176,255,146,0.2), 0 0 4px 2px rgba(176,255,146,0.35), 0 0 8px 3px rgba(176,255,146,0.15)'
                            }} />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}

      {/* Escalar Modal */}
      {escalarModal && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setEscalarModal(null)}>
          <div style={{
            width: 520,
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            padding: '28px',
            maxHeight: '90vh',
            overflowY: 'auto',
          }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
            }}>
              <div>
                <h2 style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#F5F7F7',
                  margin: '0 0 4px',
                  fontFamily: 'Satoshi, sans-serif',
                }}>
                  Escalar oportunidad
                </h2>
                <p style={{
                  fontSize: 13,
                  color: '#6F7876',
                  margin: 0,
                  fontFamily: 'DM Sans, sans-serif',
                }}>
                  {escalarModal.op.cliente} · {escalarModal.op.partner} · {escalarModal.diasSinRespuesta} días sin respuesta
                </p>
              </div>
              <button
                onClick={() => setEscalarModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6F7876',
                  padding: 0,
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#A3AEAC'}
                onMouseLeave={e => e.currentTarget.style.color = '#6F7876'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Summary Section */}
            <div style={{ marginBottom: 24 }}>
              <p style={{
                fontSize: 11,
                fontWeight: 500,
                color: '#6F7876',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                margin: '0 0 12px',
                fontFamily: 'DM Sans, sans-serif',
              }}>
                Resumen para tu manager
              </p>

              <textarea
                value={escalarModal.summary}
                onChange={e => setEscalarModal(prev => ({
                  ...prev,
                  summary: e.target.value
                }))}
                style={{
                  width: '100%',
                  minHeight: 140,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 8,
                  padding: 16,
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: 13,
                  color: '#A3AEAC',
                  lineHeight: 1.6,
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  outline: 'none',
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
              />

              <p style={{
                fontSize: 11,
                color: '#6F7876',
                margin: '8px 0 0',
                fontFamily: 'DM Sans, sans-serif',
              }}>
                ✨ Generado con IA · Editable
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: 12,
            }}>
              <button
                onClick={() => handleCopyResumen(escalarModal.summary, escalarModal.notif.id)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'transparent',
                  color: copiedId === escalarModal.notif.id ? '#B0FF92' : '#A3AEAC',
                  fontSize: 13,
                  fontFamily: 'DM Sans, sans-serif',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  if (copiedId !== escalarModal.notif.id) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                    e.currentTarget.style.color = '#F5F7F7'
                  }
                }}
                onMouseLeave={e => {
                  if (copiedId !== escalarModal.notif.id) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.color = '#A3AEAC'
                  }
                }}
              >
                <Copy size={14} />
                {copiedId === escalarModal.notif.id ? 'Copiado' : 'Copiar resumen'}
              </button>

              <button
                onClick={() => setEscalarModal(null)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: 6,
                  border: 'none',
                  background: '#B0FF92',
                  color: '#121716',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'DM Sans, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#9FFF7A'}
                onMouseLeave={e => e.currentTarget.style.background = '#B0FF92'}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
