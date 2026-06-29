import { CheckCircle, Clock, XCircle, User, Zap, Send, Mail, MessageCircle, ToggleRight, ToggleLeft, Maximize2, Minimize2, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ESTADO_CONFIG } from '../data/mockData'

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

export default function PulseCheckPanel({ op, isOpen, onClose, isExpanded, onToggleExpand, sidebarCollapsed = false }) {
  const messagesEndRef = useRef(null)
  const [messageText, setMessageText] = useState('')
  const [useDefault, setUseDefault] = useState(true)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [waitDays, setWaitDays] = useState('7')
  const [channel, setChannel] = useState('email')
  const textareaRef = useRef(null)

  const config = op ? ESTADO_CONFIG[op.estado] : {}
  const suggestedMessage = SUGGESTED_MESSAGES[op?.estado] || SUGGESTED_MESSAGES.default
  const displayMessage = useDefault ? suggestedMessage : messageText

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const handleToggleDefault = () => {
    if (useDefault) {
      setMessageText('')
      setUseDefault(false)
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 0)
    } else {
      setMessageText(suggestedMessage)
      setUseDefault(true)
    }
  }

  if (!op || !isOpen) return null

  const messagesByDate = groupMessagesByDate(MOCK_MESSAGES)
  const sortedDates = Object.keys(messagesByDate).sort()

  const sidebarWidth = sidebarCollapsed ? 64 : 240

  let panelWidth, panelLeft
  if (isExpanded) {
    panelWidth = `calc(100% - ${sidebarWidth}px)`
    panelLeft = sidebarWidth
  } else {
    panelWidth = '45%'
    panelLeft = 'calc(55% - 1px)'
  }

  return createPortal(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden auto',
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(18,23,22,0.5)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          flexShrink: 0,
          minHeight: '40px',
        }}
      >
        {/* Collapsed State: Action Buttons */}
        {!isExpanded && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onClose}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: 'rgba(255,255,255,0.04)',
                border: 'none',
                color: '#6F7876',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
                flexShrink: 0,
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
              <ChevronRight size={16} strokeWidth={1.5} />
            </button>
            <button
              onClick={onToggleExpand}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: 'rgba(255,255,255,0.04)',
                border: 'none',
                color: '#6F7876',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
                flexShrink: 0,
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
              <Maximize2 size={16} strokeWidth={1.5} />
            </button>
          </div>
        )}

        {/* Expanded State: Breadcrumb */}
        {isExpanded && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 15,
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            <button
              onClick={() => window.location.href = '/'}
              style={{
                background: 'none',
                border: 'none',
                color: '#A3AEAC',
                cursor: 'pointer',
                transition: 'color 0.15s',
                padding: 0,
                fontSize: 15,
                fontWeight: 400,
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#F5F7F7'}
              onMouseLeave={e => e.currentTarget.style.color = '#A3AEAC'}
            >
              Pipeline
            </button>
            <span style={{ color: '#6F7876', fontWeight: 400 }}>·</span>
            <button
              onClick={() => {
                onToggleExpand()
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#F5F7F7',
                cursor: 'pointer',
                transition: 'color 0.15s',
                padding: 0,
                fontSize: 15,
                fontWeight: 500,
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#B0FF92'}
              onMouseLeave={e => e.currentTarget.style.color = '#F5F7F7'}
            >
              {op.cliente}
            </button>
            <span style={{ color: '#6F7876', fontWeight: 400 }}>·</span>
            <span style={{ color: '#B0FF92', fontWeight: 500, fontSize: 15 }}>Conversación</span>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          paddingBottom: '320px',
        }}
      >
        {sortedDates.map(dateStr => (
          <div key={dateStr}>
            {/* Date separator */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                margin: '20px 0',
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: 'rgba(255,255,255,0.05)',
                }}
              />
              <p
                style={{
                  fontSize: 11,
                  color: '#6F7876',
                  margin: 0,
                  fontFamily: 'DM Sans, sans-serif',
                  whiteSpace: 'nowrap',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {getDateLabel(dateStr)}
              </p>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: 'rgba(255,255,255,0.05)',
                }}
              />
            </div>

            {/* Messages for this date */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {messagesByDate[dateStr].map(msg => {
                if (msg.type === 'cam_pulse_check') {
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <div style={{ maxWidth: '80%' }}>
                        <div
                          style={{
                            background: 'rgba(176,255,146,0.08)',
                            border: '1px solid rgba(176,255,146,0.15)',
                            borderRadius: '12px 12px 2px 12px',
                            padding: '12px 14px',
                          }}
                        >
                          <p
                            style={{
                              fontSize: 13,
                              color: '#F5F7F7',
                              margin: 0,
                              fontFamily: 'DM Sans, sans-serif',
                              lineHeight: 1.5,
                            }}
                          >
                            {msg.text}
                          </p>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            gap: 10,
                            marginTop: 6,
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            fontSize: 9,
                            color: '#6F7876',
                            fontFamily: 'DM Sans, sans-serif',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            {msg.automatic ? <Zap size={10} /> : <User size={10} />}
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
                      <div style={{ maxWidth: '80%' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '6px 12px',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 20,
                          }}
                        >
                          <Icon size={12} color={color} strokeWidth={1.5} />
                          <span
                            style={{
                              fontSize: 12,
                              color: '#A3AEAC',
                              fontFamily: 'DM Sans, sans-serif',
                            }}
                          >
                            {msg.text}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: 9,
                            color: '#6F7876',
                            margin: '6px 0 0',
                            fontFamily: 'DM Sans, sans-serif',
                          }}
                        >
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  )
                }

                if (msg.type === 'partner_detailed_response') {
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <div style={{ maxWidth: '80%' }}>
                        <div
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '12px 12px 12px 2px',
                            padding: '12px 14px',
                          }}
                        >
                          <p
                            style={{
                              fontSize: 13,
                              color: '#F5F7F7',
                              margin: 0,
                              fontFamily: 'DM Sans, sans-serif',
                              lineHeight: 1.5,
                            }}
                          >
                            {msg.text}
                          </p>
                        </div>
                        <p
                          style={{
                            fontSize: 9,
                            color: '#6F7876',
                            margin: '6px 0 0',
                            fontFamily: 'DM Sans, sans-serif',
                          }}
                        >
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
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#121716',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '12px 16px',
          zIndex: 100,
        }}
      >
        {/* Row 1 — Channel selector */}
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <p style={{ fontSize: 11, color: '#6F7876', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
            Enviar por:
          </p>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 10px',
              background: channel === 'email' ? 'rgba(176,255,146,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${channel === 'email' ? 'rgba(176,255,146,0.25)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 6,
              color: channel === 'email' ? '#B0FF92' : '#A3AEAC',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              transition: 'all 0.15s',
            }}
          >
            <Mail size={12} strokeWidth={1.5} />
            {op.partner}@example.com
          </button>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '5px 8px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6,
            opacity: 0.5,
            cursor: 'not-allowed',
          }}>
            <MessageCircle size={12} strokeWidth={1.5} color="#6F7876" />
            <span style={{ fontSize: 11, color: '#6F7876', fontFamily: 'DM Sans, sans-serif' }}>
              WhatsApp
            </span>
            <span style={{
              fontSize: 8,
              background: 'rgba(255,255,255,0.08)',
              padding: '1px 4px',
              borderRadius: 2,
              color: '#6F7876',
              fontFamily: 'DM Sans, sans-serif',
            }}>
              Próximamente
            </span>
          </div>
        </div>

        {/* Row 2 — Message textarea */}
        <textarea
          ref={textareaRef}
          value={useDefault ? suggestedMessage : messageText}
          onChange={e => setMessageText(e.target.value)}
          placeholder="Escribe tu mensaje..."
          style={{
            width: '100%',
            minHeight: 50,
            maxHeight: 100,
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 6,
            color: '#F5F7F7',
            fontSize: 12,
            padding: '8px 10px',
            fontFamily: 'DM Sans, sans-serif',
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box',
            marginBottom: 8,
            lineHeight: 1.4,
            opacity: useDefault ? 0.7 : 1,
            cursor: useDefault ? 'default' : 'text',
          }}
          readOnly={useDefault}
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
          gap: 8,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <p style={{
              fontSize: 11,
              color: '#A3AEAC',
              margin: 0,
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 500,
            }}>
              Usar predeterminado
            </p>
            <button
              onClick={handleToggleDefault}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {useDefault
                ? <ToggleRight size={24} color="#B0FF92" strokeWidth={1.5} />
                : <ToggleLeft size={24} color="#6F7876" strokeWidth={1.5} />}
            </button>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 12px',
              background: '#B0FF92',
              border: 'none',
              borderRadius: 6,
              color: '#121716',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              transition: 'opacity 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <Send size={11} strokeWidth={2} />
            Enviar
          </button>
        </div>
      </div>

      {/* Send Confirmation Modal */}
      {showConfirmModal && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
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
              width: 380,
              background: 'rgba(18,23,22,0.97)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10,
              padding: 24,
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#F5F7F7',
                margin: 0,
                fontFamily: 'Satoshi, sans-serif',
              }}
            >
              ¿Cuánto tiempo esperas respuesta?
            </h2>

            <p
              style={{
                fontSize: 12,
                color: '#6F7876',
                margin: '6px 0 16px',
                fontFamily: 'DM Sans, sans-serif',
                lineHeight: 1.5,
              }}
            >
              Si el partner no responde, la oportunidad pasará a Sin respuesta
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 10,
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: '#A3AEAC',
                  margin: 0,
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
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
                  width: 56,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6,
                  color: '#F5F7F7',
                  fontSize: 12,
                  padding: '6px 8px',
                  fontFamily: 'DM Sans, sans-serif',
                  outline: 'none',
                  boxSizing: 'border-box',
                  textAlign: 'center',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(176,255,146,0.25)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <p
                style={{
                  fontSize: 12,
                  color: '#A3AEAC',
                  margin: 0,
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                días
              </p>
            </div>

            <p
              style={{
                fontSize: 11,
                color: '#6F7876',
                margin: '0 0 16px',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              A partir del: <span style={{ fontWeight: 600, color: '#A3AEAC' }}>
                {(() => {
                  const d = new Date()
                  d.setDate(d.getDate() + parseInt(waitDays))
                  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
                })()}
              </span>
            </p>

            <div
              style={{
                display: 'flex',
                gap: 10,
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'transparent',
                  color: '#A3AEAC',
                  fontSize: 12,
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
                  padding: '7px 14px',
                  borderRadius: 6,
                  border: 'none',
                  background: '#B0FF92',
                  color: '#121716',
                  fontSize: 12,
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
        </div>
      )}
    </div>,
    document.body
  )
}
