import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Clock, XCircle, User, Zap, Send, Mail, MessageCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { ESTADO_CONFIG } from '../data/mockData'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const MOCK_MESSAGES = [
  {
    id: 1,
    type: 'cam_pulse_check',
    text: '¿Cómo va la implementación de Microsoft 365 en tu cliente?',
    timestamp: '2026-05-24T10:30:00',
    automatic: false,
    status: 'Respondido',
  },
  {
    id: 2,
    type: 'partner_quick_response',
    text: 'En negociación',
    icon: 'Clock',
    timestamp: '2026-05-24T14:15:00',
  },
  {
    id: 3,
    type: 'cam_pulse_check',
    text: 'Entendido. ¿Qué bloques se están negociando actualmente? ¿Hay algo que podamos hacer desde Beacon para acelerar el proceso?',
    timestamp: '2026-05-31T09:00:00',
    automatic: false,
    status: 'Respondido',
  },
  {
    id: 4,
    type: 'partner_detailed_response',
    text: 'Estamos en discusiones sobre el alcance de las migraciones. El cliente quiere mantener algunos sistemas legados inicialmente. Hemos propuesto una implementación en fases que debería resolver sus preocupaciones. Esperamos confirmación para finales de junio.',
    timestamp: '2026-05-31T16:45:00',
  },
  {
    id: 5,
    type: 'cam_pulse_check',
    text: '¿Ya tenemos noticias sobre la expansión de licencias?',
    timestamp: '2026-06-07T08:30:00',
    automatic: true,
    status: 'Respondido',
  },
  {
    id: 6,
    type: 'partner_quick_response',
    text: 'Deal cerrado',
    icon: 'CheckCircle',
    timestamp: '2026-06-07T11:20:00',
  },
  {
    id: 7,
    type: 'cam_pulse_check',
    text: '¡Excelente! Confírmanos los detalles del contrato y la fecha de inicio.',
    timestamp: '2026-06-15T10:00:00',
    automatic: false,
    status: 'Respondido',
  },
  {
    id: 8,
    type: 'partner_detailed_response',
    text: 'Contrato firmado por Bancolombia. Cantidad: 250 nuevas licencias de Microsoft 365 Enterprise Plus. Implementación comienza el 1 de julio. Nuestro equipo de pre-sales está coordinando con TI del cliente para planificar el rollout.',
    timestamp: '2026-06-15T13:30:00',
  },
  {
    id: 9,
    type: 'cam_pulse_check',
    text: 'Seguimiento: ¿cómo van los preparativos para el rollout del 1 de julio?',
    timestamp: '2026-06-22T09:15:00',
    automatic: true,
    status: 'Enviado',
  },
]

function formatFechaLarga(str) {
  const d = new Date(str + 'T00:00:00')
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
}

function getDateLabel(dateStr) {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const isToday = date.toDateString() === today.toDateString()
  const isYesterday = date.toDateString() === yesterday.toDateString()

  if (isToday) return 'Hoy'
  if (isYesterday) return 'Ayer'
  return formatFechaLarga(dateStr)
}

function groupMessagesByDate(messages) {
  const groups = {}
  messages.forEach(msg => {
    const dateStr = msg.timestamp.split('T')[0]
    if (!groups[dateStr]) {
      groups[dateStr] = []
    }
    groups[dateStr].push(msg)
  })
  return groups
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

const SUGGESTED_MESSAGES = {
  respondida: '¿Cómo avanza la implementación? Queremos asegurarnos de que todo va según lo planeado.',
  esperando: 'Te escribo para hacer seguimiento a la propuesta que enviamos. ¿Hay novedades?',
  sin_respuesta: 'No hemos tenido actualizaciones recientemente. ¿Podrías confirmar el estado actual?',
  nueva: '¿Cuándo podemos agendar una llamada para discutir los detalles?',
  venta_confirmada: 'Felicidades por cerrar el deal. Vamos a coordinar los próximos pasos.',
  default: '¿Cómo va todo? ¿Hay algo en lo que podamos ayudarte?',
}

export default function PulseCheckPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { oportunidades } = useApp()
  const messagesEndRef = useRef(null)
  const [messageText, setMessageText] = useState('')
  const [useDefault, setUseDefault] = useState(true)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [waitDays, setWaitDays] = useState('7')
  const [channel, setChannel] = useState('email')

  const op = oportunidades.find(o => o.id === id)

  const suggestedMessage = SUGGESTED_MESSAGES[op?.estado] || SUGGESTED_MESSAGES.default
  const displayMessage = useDefault ? suggestedMessage : messageText

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    if (useDefault) {
      setMessageText(suggestedMessage)
    }
  }, [useDefault, suggestedMessage])

  if (!op) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <p style={{ color: '#A3AEAC' }}>Oportunidad no encontrada.</p>
      </div>
    )
  }

  const config = ESTADO_CONFIG[op.estado]
  const messagesByDate = groupMessagesByDate(MOCK_MESSAGES)
  const sortedDates = Object.keys(messagesByDate).sort()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#121716',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '20px 32px',
        background: 'rgba(18,23,22,0.5)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}>
        <button
          onClick={() => navigate(`/oportunidad/${op.id}`)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#A3AEAC',
            fontSize: 13,
            fontFamily: 'DM Sans, sans-serif',
            marginBottom: 12,
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#F5F7F7'}
          onMouseLeave={e => e.currentTarget.style.color = '#A3AEAC'}
        >
          <ArrowLeft size={15} strokeWidth={1.5} />
          {op.nombre}
        </button>

        <div style={{ marginBottom: 6 }}>
          <h1 style={{
            fontSize: 32,
            fontWeight: 300,
            color: '#F5F7F7',
            margin: 0,
            fontFamily: 'Satoshi, sans-serif',
          }}>
            Conversación con {op.partner}
          </h1>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 13,
          color: '#6F7876',
          fontFamily: 'DM Sans, sans-serif',
        }}>
          {op.nombre}
          <span>·</span>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '4px 10px',
            background: config.bg,
            border: `1px solid ${config.color}`,
            borderRadius: 20,
          }}>
            <div style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: config.dot,
              boxShadow: `0 0 6px ${config.dot}`,
            }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: config.color }}>
              {config.label}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        paddingBottom: '320px',
      }}>
        {sortedDates.map(dateStr => (
          <div key={dateStr}>
            {/* Date separator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              margin: '20px 0',
            }}>
              <div style={{
                flex: 1,
                height: 1,
                background: 'rgba(255,255,255,0.05)',
              }} />
              <p style={{
                fontSize: 11,
                color: '#6F7876',
                margin: 0,
                fontFamily: 'DM Sans, sans-serif',
                whiteSpace: 'nowrap',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>
                {getDateLabel(dateStr)}
              </p>
              <div style={{
                flex: 1,
                height: 1,
                background: 'rgba(255,255,255,0.05)',
              }} />
            </div>

            {/* Messages for this date */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {messagesByDate[dateStr].map(msg => {
                if (msg.type === 'cam_pulse_check') {
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <div style={{ maxWidth: '65%' }}>
                        <div style={{
                          background: 'rgba(176,255,146,0.08)',
                          border: '1px solid rgba(176,255,146,0.15)',
                          borderRadius: '12px 12px 2px 12px',
                          padding: '12px 16px',
                        }}>
                          <p style={{
                            fontSize: 14,
                            color: '#F5F7F7',
                            margin: 0,
                            fontFamily: 'DM Sans, sans-serif',
                            lineHeight: 1.5,
                          }}>
                            {msg.text}
                          </p>
                        </div>
                        <div style={{
                          display: 'flex',
                          gap: 12,
                          marginTop: 6,
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          fontSize: 10,
                          color: '#6F7876',
                          fontFamily: 'DM Sans, sans-serif',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {msg.automatic ? <Zap size={11} /> : <User size={11} />}
                            <span>{msg.automatic ? 'Automático' : 'Manual'}</span>
                          </div>
                          <span>·</span>
                          <span>{formatTime(msg.timestamp)}</span>
                          <span>·</span>
                          <span>{msg.status}</span>
                        </div>
                      </div>
                    </div>
                  )
                }

                if (msg.type === 'partner_quick_response') {
                  const IconMap = {
                    CheckCircle: CheckCircle,
                    Clock: Clock,
                    XCircle: XCircle,
                  }
                  const Icon = IconMap[msg.icon] || CheckCircle
                  const colorMap = {
                    CheckCircle: '#B0FF92',
                    Clock: '#F5B942',
                    XCircle: '#F97316',
                  }
                  const color = colorMap[msg.icon] || '#B0FF92'

                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <div style={{ maxWidth: '65%' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 14px',
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 20,
                        }}>
                          <Icon size={14} color={color} strokeWidth={1.5} />
                          <span style={{
                            fontSize: 13,
                            color: '#A3AEAC',
                            fontFamily: 'DM Sans, sans-serif',
                          }}>
                            {msg.text}
                          </span>
                        </div>
                        <p style={{
                          fontSize: 10,
                          color: '#6F7876',
                          margin: '6px 0 0',
                          fontFamily: 'DM Sans, sans-serif',
                        }}>
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  )
                }

                if (msg.type === 'partner_detailed_response') {
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <div style={{ maxWidth: '65%' }}>
                        <div style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '12px 12px 12px 2px',
                          padding: '12px 16px',
                        }}>
                          <p style={{
                            fontSize: 14,
                            color: '#F5F7F7',
                            margin: 0,
                            fontFamily: 'DM Sans, sans-serif',
                            lineHeight: 1.5,
                          }}>
                            {msg.text}
                          </p>
                        </div>
                        <p style={{
                          fontSize: 10,
                          color: '#6F7876',
                          margin: '6px 0 0',
                          fontFamily: 'DM Sans, sans-serif',
                        }}>
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  )
                }

                return null
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area (fixed at bottom) */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 240,
        right: 0,
        background: '#121716',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 24px',
        zIndex: 100,
      }}>
        {/* Row 1 — Channel selector */}
        <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 16 }}>
          <p style={{ fontSize: 12, color: '#6F7876', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
            Enviar por:
          </p>
          <button
            onClick={() => setChannel('email')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              background: channel === 'email' ? 'rgba(176,255,146,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${channel === 'email' ? 'rgba(176,255,146,0.25)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 8,
              color: channel === 'email' ? '#B0FF92' : '#A3AEAC',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              if (channel !== 'email') {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
              }
            }}
            onMouseLeave={e => {
              if (channel !== 'email') {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
              }
            }}
          >
            <Mail size={14} strokeWidth={1.5} />
            {op.partner}@example.com
          </button>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 10px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            opacity: 0.5,
            cursor: 'not-allowed',
          }}>
            <MessageCircle size={14} strokeWidth={1.5} color="#6F7876" />
            <span style={{ fontSize: 13, color: '#6F7876', fontFamily: 'DM Sans, sans-serif' }}>
              WhatsApp
            </span>
            <span style={{
              fontSize: 10,
              background: 'rgba(255,255,255,0.08)',
              padding: '2px 6px',
              borderRadius: 4,
              color: '#6F7876',
              fontFamily: 'DM Sans, sans-serif',
            }}>
              Próximamente
            </span>
          </div>
        </div>

        {/* Row 2 — Message textarea */}
        <textarea
          value={useDefault ? suggestedMessage : messageText}
          onChange={e => !useDefault && setMessageText(e.target.value)}
          readOnly={useDefault}
          placeholder="Escribe tu mensaje al partner..."
          style={{
            width: '100%',
            minHeight: 60,
            maxHeight: 150,
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 8,
            color: '#F5F7F7',
            fontSize: 13,
            padding: '12px 14px',
            fontFamily: 'DM Sans, sans-serif',
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box',
            marginBottom: 12,
            lineHeight: 1.5,
            opacity: useDefault ? 0.7 : 1,
          }}
          onFocus={e => {
            e.target.style.borderColor = 'rgba(176,255,146,0.15)'
          }}
          onBlur={e => {
            e.target.style.borderColor = 'rgba(255,255,255,0.06)'
          }}
        />

        {/* Row 3 — Bottom actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            fontSize: 12,
            color: '#A3AEAC',
            fontFamily: 'DM Sans, sans-serif',
            userSelect: 'none',
          }}>
            <input
              type="checkbox"
              checked={!useDefault}
              onChange={e => setUseDefault(!e.target.checked)}
              style={{
                cursor: 'pointer',
                accentColor: '#B0FF92',
              }}
            />
            No usar mensaje predeterminado
          </label>

          <button
            onClick={() => setShowConfirmModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              background: '#B0FF92',
              border: 'none',
              borderRadius: 8,
              color: '#121716',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <Send size={14} strokeWidth={2} />
            Enviar Pulse Check
          </button>
        </div>
      </div>

      {/* Send Confirmation Modal */}
      {showConfirmModal && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.75)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: 440,
              background: 'rgba(18,23,22,0.97)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: 28,
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            {/* Title */}
            <h2 style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#F5F7F7',
              margin: 0,
              fontFamily: 'Satoshi, sans-serif',
            }}>
              ¿Cuánto tiempo esperas respuesta?
            </h2>

            {/* Subtitle */}
            <p style={{
              fontSize: 13,
              color: '#6F7876',
              margin: '8px 0 20px',
              fontFamily: 'DM Sans, sans-serif',
              lineHeight: 1.6,
            }}>
              Si el partner no responde en este tiempo, la oportunidad pasará a Sin respuesta
            </p>

            {/* Number input row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 12,
            }}>
              <p style={{
                fontSize: 14,
                color: '#A3AEAC',
                margin: 0,
                fontFamily: 'DM Sans, sans-serif',
              }}>
                Esperar
              </p>
              <input
                type="number"
                value={waitDays}
                onChange={e => {
                  const val = Math.max(1, Math.min(90, parseInt(e.target.value) || 1))
                  setWaitDays(String(val))
                }}
                min="1"
                max="90"
                style={{
                  width: 64,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#F5F7F7',
                  fontSize: 14,
                  padding: '8px 10px',
                  fontFamily: 'DM Sans, sans-serif',
                  outline: 'none',
                  boxSizing: 'border-box',
                  textAlign: 'center',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(176,255,146,0.25)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <p style={{
                fontSize: 14,
                color: '#A3AEAC',
                margin: 0,
                fontFamily: 'DM Sans, sans-serif',
              }}>
                días antes de marcar como Sin respuesta
              </p>
            </div>

            {/* Calculated date */}
            <p style={{
              fontSize: 12,
              color: '#6F7876',
              margin: '0 0 24px',
              fontFamily: 'DM Sans, sans-serif',
            }}>
              Sin respuesta a partir del: <span style={{ fontWeight: 600, color: '#A3AEAC' }}>
                {(() => {
                  const d = new Date()
                  d.setDate(d.getDate() + parseInt(waitDays))
                  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
                })()}
              </span>
            </p>

            {/* Buttons */}
            <div style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  padding: '9px 18px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'transparent',
                  color: '#A3AEAC',
                  fontSize: 13,
                  fontFamily: 'DM Sans, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#F5F7F7'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = '#A3AEAC'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false)
                }}
                style={{
                  padding: '9px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#B0FF92',
                  color: '#121716',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'DM Sans, sans-serif',
                  cursor: 'pointer',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Enviar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
