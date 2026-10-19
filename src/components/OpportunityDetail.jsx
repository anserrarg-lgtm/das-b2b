import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Send, StickyNote, ToggleLeft, ToggleRight, CheckCircle2, CheckCircle, MessageSquare, Clock, Plus, XCircle, MessageCircle, ChevronDown, ChevronRight, Maximize2, PauseCircle, Settings2, Sparkles, Mail } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { ESTADO_CONFIG } from '../data/mockData'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import PulseCheckPanel from './PulseCheckPanel'
import Toggle from './Toggle'

function formatValor(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function formatFechaLarga(str) {
  const d = new Date(str + 'T00:00:00')
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const parts = dateStr.split('-')
  const date = new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]))
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
}

const TIPO_ICONS = {
  pulse_check: Send,
  respuesta: MessageSquare,
  nota: StickyNote,
  reunion: CheckCircle2,
  creacion: Plus,
  cierre: CheckCircle2,
}

const TIPO_COLORS = {
  pulse_check: '#F5B942',
  respuesta: '#B0FF92',
  nota: '#5FBFF9',
  reunion: '#5863F8',
  creacion: '#6F7876',
  cierre: '#B0FF92',
}

const PULSE_ESTADO_CONFIG = {
  'Enviado': { color: '#A3AEAC', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)' },
  'Abierto': { color: '#A3AEAC', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)' },
  'Respondido': { color: '#B0FF92', bg: 'rgba(176,255,146,0.1)', border: 'rgba(176,255,146,0.2)' },
}

function getDefaultMessage(op) {
  const lastPulse = op?.pulseChecks?.[op.pulseChecks.length - 1]
  const lastResponse = lastPulse?.partnerResponse?.text || lastPulse?.partnerResponse?.type || ''

  if (op?.estado === 'venta_confirmada') {
    return `Hola, gracias por confirmar la venta con ${op?.cliente}. Para registrar correctamente la atribución necesitamos los detalles: ¿qué producto se vendió, cuántas licencias y cuál fue la fecha de cierre?`
  }

  if (op?.estado === 'respondida') {
    if (lastResponse.includes('22 de junio') || lastResponse.includes('firma') || lastResponse.includes('orden de compra') || lastResponse.includes('listo')) {
      return `Perfecto, estaremos pendientes para esa fecha. Cualquier novedad nos avisas, estamos para apoyarte.`
    }
    if (lastResponse.includes('negociación') || lastResponse.includes('propuesta') || lastResponse.includes('ajustando') || lastResponse.includes('revisión')) {
      return `Entendido, ¿hay algo en lo que podamos apoyarte para avanzar con ${op?.cliente}?`
    }
    if (lastResponse.includes('interesado') || lastResponse.includes('demo') || lastResponse.includes('evaluando') || lastResponse.includes('aprobó')) {
      return `Excelente, ¿cuándo estiman tomar la decisión final? Queremos asegurarnos de tener todo listo.`
    }
    return `Hola, ¿cómo va el proceso con ${op?.cliente}? ¿Hay alguna novedad que podamos registrar?`
  }

  if (op?.estado === 'sin_respuesta') {
    return `Hola, llevamos un tiempo sin noticias sobre ${op?.cliente}. ¿Sigue activa esta oportunidad? Nos interesa saber si hay algo que esté bloqueando el proceso.`
  }

  if (op?.estado === 'esperando') {
    return `Hola, retomamos el contacto sobre ${op?.cliente}. ¿Pudiste avanzar con ellos?`
  }

  return `Hola, ¿cómo va el proceso con ${op?.cliente}?`
}

export default function OpportunityDetail({ isSidebarCollapsed = false }) {
  const { id } = useParams()
  const { oportunidades, toggleAutomatico, enviarPulseCheck, agregarNota, cerrarComoGanada, cerrarComoPerdida, cambiarEstado } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const fromNuevas = location.state?.from === 'nuevas'
  const [noteMode, setNoteMode] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [confirmAction, setConfirmAction] = useState(null) // null | 'ganada' | 'perdida'
  const [pulseCheckPanelOpen, setPulseCheckPanelOpen] = useState(false)
  const [pulseCheckPanelExpanded, setPulseCheckPanelExpanded] = useState(false)
  const [showAutomationModal, setShowAutomationModal] = useState(false)
  const [showPulseChat, setShowPulseChat] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [automationEnabled, setAutomationEnabled] = useState(true)
  const [automationFrequency, setAutomationFrequency] = useState('7')
  const [automationResponseWindow, setAutomationResponseWindow] = useState('7')
  const [showPauseModal, setShowPauseModal] = useState(false)
  const [pauseDate, setPauseDate] = useState('')
  const [pauseReason, setPauseReason] = useState('')
  const [pauseSendPulse, setPauseSendPulse] = useState(true)
  const [pauseMessage, setPauseMessage] = useState('Hola [nombre], retomamos el contacto sobre [cliente]. ¿Pudiste avanzar con ellos? Estamos listos para apoyarte en lo que necesites.')
  const [selectedMessageId, setSelectedMessageId] = useState(null)
  const [usarPredeterminado, setUsarPredeterminado] = useState(true)
  const [mensajeChat, setMensajeChat] = useState('')
  const [chatVisible, setChatVisible] = useState(false)
  const messagesEndRef = useRef(null)
  const messagesBottomRef = useRef(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const mainContent = document.querySelector('main') ||
                        document.querySelector('.main-content') ||
                        document.getElementById('main-content')
    if (mainContent) mainContent.scrollTop = 0
  }, [])

  useEffect(() => {
    if (location.state?.openPulseChat) {
      const timer = setTimeout(() => {
        setShowPulseChat(true)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [location.state])

  useEffect(() => {
    const container = document.querySelector('.opportunity-detail-container')
    if (container) container.scrollTop = 0
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [id])

  useEffect(() => {
    if (showPulseChat && messagesBottomRef.current) {
      setChatVisible(false)
      const delay = location.state?.openPulseChat ? 400 : 150
      setTimeout(() => {
        messagesBottomRef.current?.scrollIntoView({ behavior: 'instant' })
        setTimeout(() => setChatVisible(true), 50)
      }, delay)
    } else {
      setChatVisible(false)
    }
  }, [showPulseChat, id])

  const op = oportunidades.find(o => o.id === id)

  console.log('pulseChecks:', op?.pulseChecks, 'count:', op?.pulseChecks?.length || 0)

  if (!op) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <p style={{ color: '#A3AEAC' }}>Oportunidad no encontrada.</p>
        <button onClick={() => navigate('/')} style={{ marginTop: 16, color: '#B0FF92', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
          Volver al pipeline
        </button>
      </div>
    )
  }

  const config = ESTADO_CONFIG[op.estado]

  const handleCloseChat = () => {
    setIsClosing(true)
    setTimeout(() => {
      setShowPulseChat(false)
      setIsClosing(false)
    }, 500)
  }

  const formatChatDate = (dateStr) => {
    if (!dateStr) return ''
    try {
      const parts = dateStr.split('-')
      if (parts.length === 3) {
        const date = new Date(
          parseInt(parts[0]),
          parseInt(parts[1]) - 1,
          parseInt(parts[2])
        )
        return date.toLocaleDateString('es-CO', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      }
      return dateStr
    } catch(e) {
      return dateStr
    }
  }

  function handleNoteSubmit(e) {
    e.preventDefault()
    if (noteText.trim()) {
      agregarNota(op.id, noteText.trim())
      setNoteText('')
      setNoteMode(false)
    }
  }

  return (
    <div className="opportunity-detail-container" style={{ padding: '32px', maxWidth: 960, margin: '0 auto' }}>
      {/* 2026-10-19, a pedido de Ana: se quitó el botón "< Pipeline" de back-nav
        * de acá -- en desktop (único breakpoint soportado, ver App.jsx) ese
        * rol ya lo cumple la flecha de atrás del navegador, así que era
        * redundante tener una propia dentro de la app. */}

      {/* Title section */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1
              style={{ fontSize: 40, fontWeight: 300, color: '#F5F7F7', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1, fontFamily: 'Satoshi, sans-serif' }}
            >
              {op.cliente}
            </h1>
            <p style={{ fontSize: 18, color: '#A3AEAC', margin: '4px 0 0', fontFamily: 'DM Sans, sans-serif', fontWeight: 400 }}>
              {op.partner}
            </p>
          </div>
          <StatusBadge config={config} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Info card */}
          <Section title="Información">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* BLOCK 1 - DEAL */}
              <div>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', color: '#6F7876', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px', fontWeight: 500 }}>
                  Deal
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                  <InfoItem label="Cliente" value={op.cliente} />
                  <InfoItem label="Partner" value={op.partner} />
                  <div style={{ gridColumn: '1 / -1' }}>
                    <InfoItem label="Correo del partner" value={op.partnerEmail} />
                  </div>
                  {op.estado === 'sin_respuesta' && op.diasSinRespuesta > 0 && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <InfoItem label="Sin respuesta" value={
                        <span style={{ color: '#F97316', fontWeight: 600 }}>{op.diasSinRespuesta} días</span>
                      } />
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '20px 0' }} />

              {/* BLOCK 2 - CONTRATO */}
              <div>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', color: '#6F7876', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px', fontWeight: 500 }}>
                  Contrato
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                  <InfoItem label="Tipo de contrato" value={op.tipoContrato} />
                  <InfoItem label="Última actividad" value={formatFechaLarga(op.ultimaActividad)} />
                  <InfoItem label="Valor del contrato" value={
                    <span className="font-clash" style={{ fontSize: 20, fontWeight: 700, color: '#F5F7F7', letterSpacing: '-0.01em' }}>
                      {formatValor(op.valor)}
                    </span>
                  } />
                  <div style={{ gridColumn: '1 / -1' }}>
                    <InfoItem label="Fecha estimada de cierre" value={
                      <span style={{ fontFamily: 'Satoshi', fontSize: 15, fontWeight: 500, color: '#F5F7F7' }}>
                        {formatDate(op.fechaCierre)}
                      </span>
                    } />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '20px 0' }} />

              {/* BLOCK 3 - PRODUCTO */}
              <div>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', color: '#6F7876', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px', fontWeight: 500 }}>
                  Producto
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <InfoItem label="Producto" value={op.producto} />
                  <InfoItem label="Cantidad" value={op.cantidad} />
                </div>
              </div>
            </div>
          </Section>

          {/* Partner performance */}
          <PartnerPerformanceSection op={op} oportunidades={oportunidades} />

          {/* Note */}
          <Section title="Nota actual">
            <p style={{ fontSize: 14, color: '#A3AEAC', lineHeight: 1.6, margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
              {op.nota || 'Sin notas disponibles.'}
            </p>
            {!noteMode ? (
              <button
                onClick={() => setNoteMode(true)}
                style={{
                  marginTop: 12,
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  padding: '7px 12px',
                  color: '#A3AEAC',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                <StickyNote size={13} strokeWidth={1.5} />
                Agregar nota
              </button>
            ) : (
              <form onSubmit={handleNoteSubmit} style={{ marginTop: 12 }}>
                <textarea
                  autoFocus
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Escribe una nota sobre esta oportunidad..."
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(176,255,146,0.25)',
                    borderRadius: 8,
                    color: '#F5F7F7',
                    fontSize: 13,
                    padding: '10px 12px',
                    resize: 'none',
                    outline: 'none',
                    fontFamily: 'DM Sans, sans-serif',
                    minHeight: 80,
                    lineHeight: 1.5,
                  }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setNoteMode(false)} style={cancelBtnStyle}>Cancelar</button>
                  <button type="submit" style={saveBtnStyle}>Guardar nota</button>
                </div>
              </form>
            )}
          </Section>

          {/* Timeline */}
          <Section title="Línea de tiempo">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {op.timeline.map((item, i) => {
                const Icon = TIPO_ICONS[item.tipo] || Clock
                const color = TIPO_COLORS[item.tipo] || '#6F7876'
                const isLast = i === op.timeline.length - 1
                return (
                  <div key={i} style={{ display: 'flex', gap: 14 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        width: 30, height: 30,
                        borderRadius: '50%',
                        background: `rgba(${hexToRgb(color)},0.12)`,
                        border: `1px solid rgba(${hexToRgb(color)},0.2)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Icon size={13} strokeWidth={1.5} color={color} />
                      </div>
                      {!isLast && (
                        <div style={{ width: 1, flex: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
                      )}
                    </div>
                    <div style={{ paddingBottom: isLast ? 0 : 20, paddingTop: 4, flex: 1 }}>
                      <p style={{ fontSize: 11, color: '#6F7876', margin: '0 0 3px', fontFamily: 'DM Sans, sans-serif' }}>
                        {formatFechaLarga(item.fecha)}
                      </p>
                      <p style={{ fontSize: 13, color: '#A3AEAC', margin: 0, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5 }}>
                        {item.descripcion}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Quick actions */}
          <Section title="Acciones">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* 1. Enviar Pulse Check */}
              <button
                onClick={() => {
                  const periodoAtribucion = parseInt(localStorage.getItem('periodoAtribucion') || '7')
                  const pulseCheck = {
                    id: `pulse_${op.id}_${Date.now()}`,
                    date: new Date().toISOString().slice(0,10),
                    type: 'manual',
                    sentBy: 'Carlos',
                    message: getDefaultMessage(op),
                    status: 'enviado'
                  }
                  enviarPulseCheck(op.id, pulseCheck)
                  if (op.estado === 'nueva') {
                    cambiarEstado(op.id, 'esperando')
                  }
                  setShowPulseChat(true)
                }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#A3AEAC', fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', width: '100%', textAlign: 'left', transition: 'all 0.2s ease' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#F5F7F7'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#A3AEAC'; e.currentTarget.style.background = 'transparent' }}
              >
                <Send size={16} strokeWidth={2} />
                Enviar Pulse Check
              </button>

              {/* 2. Poner en espera */}
              <button
                onClick={() => setShowPauseModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#A3AEAC', fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', width: '100%', textAlign: 'left', transition: 'all 0.2s ease' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#F5F7F7'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#A3AEAC'; e.currentTarget.style.background = 'transparent' }}
              >
                <PauseCircle size={16} strokeWidth={2} />
                Poner en espera
              </button>

              {/* 3. Configurar automatización */}
              <button
                onClick={() => setShowAutomationModal(!showAutomationModal)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#A3AEAC', fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', width: '100%', textAlign: 'left', transition: 'all 0.2s ease' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#F5F7F7'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#A3AEAC'; e.currentTarget.style.background = 'transparent' }}
              >
                <Settings2 size={16} strokeWidth={2} />
                Configurar automatización
              </button>


              {/* Divider */}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '8px 0' }} />

              {/* 5. Cerrar como ganada */}
              <button
                onClick={() => setConfirmAction('ganada')}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#A3AEAC', fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', width: '100%', textAlign: 'left', transition: 'all 0.2s ease' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#F5F7F7'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#A3AEAC'; e.currentTarget.style.background = 'transparent' }}
              >
                <CheckCircle size={16} strokeWidth={2} />
                Cerrar como ganada
              </button>

              {/* 6. Descalificar */}
              <button
                onClick={() => setConfirmAction('perdida')}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#A3AEAC', fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', width: '100%', textAlign: 'left', transition: 'all 0.2s ease' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#F5F7F7'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#A3AEAC'; e.currentTarget.style.background = 'transparent' }}
              >
                <XCircle size={16} strokeWidth={2} />
                Descalificar
              </button>
            </div>
          </Section>

          {/* Pulse check history */}
          {op.estado !== 'nueva' && (
            <Section title="Historial de Pulse Checks">
              {op.pulseChecks.length === 0 ? (
                <p style={{ fontSize: 13, color: '#6F7876', fontFamily: 'DM Sans, sans-serif' }}>
                  Sin Pulse Checks enviados.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {op.pulseChecks.slice(-3).reverse().map((pc, i) => {
                    const pcDate = pc.date || pc.fecha
                    const pcPartner = pc.sentBy || pc.destinatario
                    const hasResponse = pc.partnerResponse || pc.status === 'respondido' || pc.estado === 'Respondido'
                    const badgeText = hasResponse ? 'Respondido' : 'Enviado'
                    const badgeColor = hasResponse ? '#B0FF92' : '#A3AEAC'
                    const badgeBg = hasResponse ? 'rgba(176,255,146,0.1)' : 'rgba(255,255,255,0.06)'
                    const badgeBorder = hasResponse ? 'rgba(176,255,146,0.2)' : 'rgba(255,255,255,0.1)'

                    return (
                      <div
                        key={i}
                        onClick={() => {
                          setShowPulseChat(true)
                          setSelectedMessageId(pcDate)
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: 8,
                            gap: 8,
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 12, color: '#F5F7F7', margin: 0, fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
                              {formatFechaLarga(pcDate)}
                            </p>
                            <p style={{ fontSize: 11, color: '#6F7876', margin: '2px 0 0', fontFamily: 'DM Sans, sans-serif' }}>
                              {pcPartner}
                            </p>
                          </div>
                          <span style={{
                            fontSize: 11, fontWeight: 600,
                            color: badgeColor,
                            background: badgeBg,
                            border: `1px solid ${badgeBorder}`,
                            padding: '2px 8px',
                            borderRadius: 4,
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                          }}>
                            {badgeText}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  {op.pulseChecks.length > 0 && (
                    <button
                      onClick={() => setShowPulseChat(true)}
                      style={{
                        marginTop: 12,
                        background: 'none',
                        border: 'none',
                        color: '#B0FF92',
                        fontSize: 13,
                        fontFamily: 'DM Sans, sans-serif',
                        cursor: 'pointer',
                        textAlign: 'left',
                        padding: 0,
                        transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '0.7' }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                    >
                      Ver conversación completa →
                    </button>
                  )}
                </div>
              )}
            </Section>
          )}

          <PulseSchedule op={op} onToggle={() => toggleAutomatico(op.id)} />

        </div>
      </div>

      {/* Confirmation modal */}
      {confirmAction && createPortal(
        <div
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setConfirmAction(null)}
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
            <h3 className="font-clash" style={{ fontSize: 18, fontWeight: 700, color: '#F5F7F7', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
              {confirmAction === 'ganada' ? '¿Cerrar como ganada?' : '¿Descalificar esta oportunidad?'}
            </h3>
            <p style={{ fontSize: 13, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', margin: '0 0 24px', lineHeight: 1.6 }}>
              {confirmAction === 'ganada'
                ? 'Esta oportunidad se moverá al Historial y contará para tu bono del período actual.'
                : 'Esta oportunidad se moverá al Historial. Puedes reactivarla cuando quieras desde ahí.'}
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmAction(null)}
                style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#A3AEAC', fontSize: 13, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#F5F7F7'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#A3AEAC'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (confirmAction === 'ganada') cerrarComoGanada(op.id)
                  else cerrarComoPerdida(op.id)
                  setConfirmAction(null)
                  setToastMsg('Oportunidad movida al Historial')
                  setTimeout(() => setToastMsg(null), 3000)
                }}
                style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: '#B0FF92', color: '#121716', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', transition: 'opacity 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.88' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Pause Modal */}
      {showPauseModal && createPortal(
        <div
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.75)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setShowPauseModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '480px',
              background: 'rgba(18,23,22,0.97)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '28px',
              backdropFilter: 'blur(24px)',
            }}
          >
            {/* Title */}
            <h2 className="font-clash" style={{ fontSize: 18, fontWeight: 700, color: '#F5F7F7', margin: '0 0 24px', letterSpacing: '-0.02em' }}>
              Poner en espera
            </h2>

            {/* Date Picker */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', marginBottom: 6 }}>
                ¿Hasta cuándo?
              </label>
              <input
                type="date"
                value={pauseDate}
                onChange={e => setPauseDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  color: '#F5F7F7',
                  fontSize: 13,
                  fontFamily: 'DM Sans, sans-serif',
                  colorScheme: 'dark',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Optional Note */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', marginBottom: 6 }}>
                Motivo (opcional)
              </label>
              <textarea
                value={pauseReason}
                onChange={e => setPauseReason(e.target.value)}
                placeholder="ej. El cliente decide en junio"
                style={{
                  width: '100%',
                  minHeight: '60px',
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  color: '#F5F7F7',
                  fontSize: 13,
                  fontFamily: 'DM Sans, sans-serif',
                  colorScheme: 'dark',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 20 }} />

            {/* Pulse Check Automático al Reactivar */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <button
                  onClick={() => setPauseSendPulse(!pauseSendPulse)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 32, height: 32,
                    background: pauseSendPulse ? '#B0FF92' : 'rgba(255,255,255,0.08)',
                    border: 'none', borderRadius: 6, cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {pauseSendPulse && <span style={{ color: '#121716', fontWeight: 600, fontSize: 16 }}>✓</span>}
                </button>
                <label style={{ fontSize: 14, color: '#F5F7F7', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, cursor: 'pointer', flex: 1 }}>
                  Enviar Pulse Check automático al reactivarse
                </label>
              </div>

              {pauseSendPulse && (
                <div style={{ paddingLeft: 44 }}>
                  <label style={{ display: 'block', fontSize: 11, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Mensaje de reactivación
                  </label>
                  <textarea
                    value={pauseMessage}
                    onChange={e => setPauseMessage(e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: '80px',
                      padding: '10px 12px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 8,
                      color: '#F5F7F7',
                      fontSize: 13,
                      fontFamily: 'DM Sans, sans-serif',
                      colorScheme: 'dark',
                      boxSizing: 'border-box',
                      resize: 'vertical',
                      marginBottom: 8,
                    }}
                  />
                  <p style={{ fontSize: 11, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', margin: 0, lineHeight: 1.5 }}>
                    ✨ Editable · La IA ajustará este mensaje según el contexto cuando se reactive
                  </p>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowPauseModal(false)}
                style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#A3AEAC', fontSize: 13, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#F5F7F7'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#A3AEAC'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowPauseModal(false)
                }}
                style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: '#B0FF92', color: '#121716', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', transition: 'opacity 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.88' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Automation Modal */}
      {showAutomationModal && createPortal(
        <div
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.75)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setShowAutomationModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '460px',
              background: 'rgba(18,23,22,0.97)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '28px',
              backdropFilter: 'blur(24px)',
            }}
          >
            {/* Title */}
            <h2 className="font-clash" style={{ fontSize: 18, fontWeight: 700, color: '#F5F7F7', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              Automatización del Pulse Check
            </h2>

            {/* Subtitle */}
            <p style={{ fontSize: 13, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', margin: '0 0 20px' }}>
              {op.cliente}
            </p>

            {/* Toggle row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <button
                onClick={() => setAutomationEnabled(!automationEnabled)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32,
                  background: automationEnabled ? '#B0FF92' : 'rgba(255,255,255,0.08)',
                  border: 'none', borderRadius: 6, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {automationEnabled && <span style={{ color: '#121716', fontWeight: 600, fontSize: 16 }}>✓</span>}
              </button>
              <label style={{ fontSize: 14, color: '#F5F7F7', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, cursor: 'pointer', flex: 1 }}>
                Pulse Check automático
              </label>
            </div>

            {automationEnabled && (
              <>
                {/* Frecuencia */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 11, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Frecuencia
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: '#A3AEAC', fontFamily: 'DM Sans, sans-serif' }}>Enviar cada</span>
                    <input
                      type="number"
                      value={automationFrequency}
                      onChange={e => setAutomationFrequency(e.target.value)}
                      min="1"
                      max="90"
                      style={{
                        width: 60,
                        padding: '8px 10px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 6,
                        color: '#F5F7F7',
                        fontSize: 13,
                        fontFamily: 'DM Sans, sans-serif',
                        outline: 'none',
                        boxSizing: 'border-box',
                        textAlign: 'center',
                      }}
                    />
                    <span style={{ fontSize: 13, color: '#A3AEAC', fontFamily: 'DM Sans, sans-serif' }}>días</span>
                  </div>
                  <button
                    onClick={() => setAutomationFrequency('7')}
                    style={{
                      fontSize: 11,
                      color: '#B0FF92',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'DM Sans, sans-serif',
                      padding: 0,
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.7' }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                  >
                    Usar configuración global (7 días)
                  </button>
                </div>

                {/* Ventana de respuesta */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 11, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Ventana de respuesta
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: '#A3AEAC', fontFamily: 'DM Sans, sans-serif' }}>Mover a Sin respuesta si no responde en</span>
                    <input
                      type="number"
                      value={automationResponseWindow}
                      onChange={e => setAutomationResponseWindow(e.target.value)}
                      min="1"
                      max="90"
                      style={{
                        width: 60,
                        padding: '8px 10px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 6,
                        color: '#F5F7F7',
                        fontSize: 13,
                        fontFamily: 'DM Sans, sans-serif',
                        outline: 'none',
                        boxSizing: 'border-box',
                        textAlign: 'center',
                      }}
                    />
                    <span style={{ fontSize: 13, color: '#A3AEAC', fontFamily: 'DM Sans, sans-serif' }}>días</span>
                  </div>
                  <button
                    onClick={() => setAutomationResponseWindow('7')}
                    style={{
                      fontSize: 11,
                      color: '#B0FF92',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'DM Sans, sans-serif',
                      padding: 0,
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.7' }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                  >
                    Usar configuración global (7 días)
                  </button>
                </div>

                {/* Info note */}
                <p style={{ fontSize: 12, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', margin: '16px 0 0', lineHeight: 1.5 }}>
                  Los mensajes son generados automáticamente con IA según el estado de la oportunidad en el momento del envío.
                </p>
              </>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 24 }}>
              <button
                onClick={() => setShowAutomationModal(false)}
                style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#A3AEAC', fontSize: 13, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#F5F7F7'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#A3AEAC'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowAutomationModal(false)
                }}
                style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: '#B0FF92', color: '#121716', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', transition: 'opacity 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.88' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Pulse Check Panel */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: pulseCheckPanelExpanded ? 'auto' : 0,
        left: pulseCheckPanelExpanded ? '240px' : 'auto',
        width: pulseCheckPanelExpanded ? 'calc(100vw - 240px)' : '45vw',
        height: '100vh',
        zIndex: 1000,
        background: '#121716',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        transform: showPulseChat && !isClosing
          ? 'translateX(0)'
          : 'translateX(100%)',
        transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
        opacity: showPulseChat ? 1 : 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%'
        }}>

          {/* Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <button onClick={handleCloseChat} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px',
              width: '28px', height: '28px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer', color: '#6F7876'
            }}>
              <ChevronRight size={14}/>
            </button>
            <button onClick={() => setPulseCheckPanelExpanded(!pulseCheckPanelExpanded)} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px',
              width: '28px', height: '28px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer', color: '#6F7876'
            }}>
              <Maximize2 size={14}/>
            </button>
            {pulseCheckPanelExpanded && (
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <span
                  onClick={() => navigate('/')}
                  style={{cursor: 'pointer', color: '#A3AEAC', fontSize: '14px', fontFamily: 'DM Sans', fontWeight: 400}}
                >
                  Pipeline
                </span>
                {fromNuevas && (
                  <>
                    <span style={{color: '#6F7876', fontSize: '13px'}}>·</span>
                    <span
                      onClick={() => navigate('/nuevas')}
                      style={{cursor: 'pointer', color: '#A3AEAC', fontSize: '14px', fontFamily: 'DM Sans'}}
                    >
                      Recién cargadas
                    </span>
                  </>
                )}
                <span style={{color: '#6F7876', fontSize: '13px'}}>·</span>
                <span
                  onClick={() => setPulseCheckPanelExpanded(false)}
                  style={{cursor: 'pointer', color: '#F5F7F7', fontSize: '14px', fontFamily: 'DM Sans', fontWeight: 500}}
                >
                  {op?.cliente}
                </span>
                <span style={{color: '#6F7876', fontSize: '13px'}}>·</span>
                <span style={{color: '#B0FF92', fontSize: '14px', fontFamily: 'DM Sans', fontWeight: 500}}>
                  Conversación
                </span>
              </div>
            )}
          </div>

          {/* Messages */}
          <div ref={messagesEndRef} style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            overflowAnchor: 'none',
            visibility: showPulseChat ? 'visible' : 'hidden',
            opacity: chatVisible ? 1 : 0
          }}>
            {op.estado === 'nueva' ? (
              <>
                {op.crmContext ? (
                  <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderLeft: '2px solid rgba(255,255,255,0.15)',
                    borderRadius: '4px',
                    padding: '14px',
                    marginBottom: '20px'
                  }}>
                    <p style={{
                      margin: '0 0 8px',
                      fontFamily: 'DM Sans',
                      fontSize: '10px',
                      color: '#6F7876',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontWeight: 500
                    }}>
                      CONTEXTO DEL CRM
                    </p>
                    <p style={{
                      margin: 0,
                      fontFamily: 'DM Sans',
                      fontSize: '13px',
                      color: '#A3AEAC',
                      fontStyle: 'italic',
                      lineHeight: 1.5
                    }}>
                      {op.crmContext}
                    </p>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                    textAlign: 'center'
                  }}>
                    <MessageCircle size={32} color="#6F7876" style={{marginBottom: '12px'}} />
                    <p style={{
                      margin: 0,
                      fontFamily: 'DM Sans',
                      fontSize: '14px',
                      color: '#6F7876',
                      fontWeight: 500,
                      marginBottom: '8px'
                    }}>
                      Sin conversación previa
                    </p>
                    <p style={{
                      margin: 0,
                      fontFamily: 'DM Sans',
                      fontSize: '12px',
                      color: '#3D4F6E',
                      lineHeight: 1.5
                    }}>
                      El mensaje de IA tomará en cuenta<br/>el contexto de la oportunidad
                    </p>
                  </div>
                )}
              </>
            ) : op.estado === 'sin_respuesta' && op.pulseChecks && op.pulseChecks.length > 0 ? (
              <>
                {op.pulseChecks.map((pc, idx) => {
                  const pcDateStr = formatChatDate(pc.date)
                  const partnerDate = formatChatDate(pc.partnerResponse?.date)

                  let showDateSeparator = false
                  if (idx === 0) {
                    showDateSeparator = true
                  } else if (idx > 0 && pc.date && op.pulseChecks[idx - 1].date) {
                    const currentDate = new Date(pc.date)
                    const prevDate = new Date(op.pulseChecks[idx - 1].date)
                    const weeksDiff = Math.floor((prevDate - currentDate) / (7 * 24 * 60 * 60 * 1000))
                    if (weeksDiff !== 0) {
                      showDateSeparator = true
                    }
                  }

                  return (
                    <div key={idx}>
                      {showDateSeparator && (
                        <div style={{
                          textAlign: 'center',
                          color: '#6F7876',
                          fontSize: '12px',
                          fontFamily: 'DM Sans',
                          marginBottom: '20px',
                          marginTop: idx > 0 ? '20px' : '0'
                        }}>
                          {pcDateStr}
                        </div>
                      )}
                      <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '16px'}}>
                        <div style={{
                          background: 'rgba(176,255,146,0.08)',
                          border: '1px solid rgba(176,255,146,0.15)',
                          borderRadius: '12px 12px 2px 12px',
                          padding: '12px 16px',
                          maxWidth: '65%'
                        }}>
                          <p style={{margin: 0, fontFamily: 'DM Sans', fontSize: '14px', color: '#F5F7F7', lineHeight: 1.5}}>
                            {pc.message}
                          </p>
                          <p style={{margin: '4px 0 0', fontFamily: 'DM Sans', fontSize: '10px', color: '#6F7876'}}>
                            Enviado ✓ · {pcDateStr}
                          </p>
                        </div>
                      </div>
                      {pc.partnerResponse && (
                        <div style={{display: 'flex', justifyContent: 'flex-start', marginBottom: '16px', flexDirection: 'column'}}>
                          <p style={{fontSize: '10px', fontFamily: 'DM Sans', color: '#6F7876', margin: '0 0 4px'}}>
                            {pc.partnerResponse.type === 'quick' ? 'Respuesta rápida' : 'Respuesta del partner'}
                          </p>
                          {pc.partnerResponse.type === 'quick' ? (
                            <>
                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'rgba(176,255,146,0.08)',
                                border: '1px solid rgba(176,255,146,0.2)',
                                borderRadius: '20px',
                                padding: '6px 14px',
                                color: '#B0FF92',
                                fontFamily: 'DM Sans',
                                fontSize: '13px'
                              }}>
                                ✓ {pc.partnerResponse.text}
                              </div>
                              <p style={{fontFamily: 'DM Sans', fontSize: '10px', color: '#6F7876', margin: '4px 0 0'}}>
                                {partnerDate}
                              </p>
                            </>
                          ) : (
                            <div style={{
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.06)',
                              borderRadius: '12px 12px 12px 2px',
                              padding: '12px 16px',
                              maxWidth: '65%'
                            }}>
                              <p style={{margin: 0, fontFamily: 'DM Sans', fontSize: '14px', color: '#F5F7F7', lineHeight: 1.5}}>
                                {pc.partnerResponse.text}
                              </p>
                              <p style={{margin: '4px 0 0', fontFamily: 'DM Sans', fontSize: '10px', color: '#6F7876'}}>
                                {partnerDate}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </>
            ) : op.pulseChecks && op.pulseChecks.length > 0 ? (
              <>
                {op.pulseChecks.map((pc, idx) => {
                  const pcDateStr = formatChatDate(pc.date)
                  const partnerDate = formatChatDate(pc.partnerResponse?.date)

                  return (
                    <div key={idx}>
                      <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '16px'}}>
                        <div style={{
                          background: 'rgba(176,255,146,0.08)',
                          border: '1px solid rgba(176,255,146,0.15)',
                          borderRadius: '12px 12px 2px 12px',
                          padding: '12px 16px',
                          maxWidth: '65%'
                        }}>
                          <p style={{margin: 0, fontFamily: 'DM Sans', fontSize: '14px', color: '#F5F7F7', lineHeight: 1.5}}>
                            {pc.message}
                          </p>
                          <p style={{margin: '4px 0 0', fontFamily: 'DM Sans', fontSize: '10px', color: '#6F7876'}}>
                            Enviado ✓ · {pcDateStr}
                          </p>
                        </div>
                      </div>
                      {pc.partnerResponse && (
                        <div style={{display: 'flex', justifyContent: 'flex-start', marginBottom: '16px', flexDirection: 'column'}}>
                          <p style={{fontSize: '10px', fontFamily: 'DM Sans', color: '#6F7876', margin: '0 0 4px'}}>
                            {pc.partnerResponse.type === 'quick' ? 'Respuesta rápida' : 'Respuesta del partner'}
                          </p>
                          {pc.partnerResponse.type === 'quick' ? (
                            <>
                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'rgba(176,255,146,0.08)',
                                border: '1px solid rgba(176,255,146,0.2)',
                                borderRadius: '20px',
                                padding: '6px 14px',
                                color: '#B0FF92',
                                fontFamily: 'DM Sans',
                                fontSize: '13px'
                              }}>
                                ✓ {pc.partnerResponse.text}
                              </div>
                              <p style={{fontFamily: 'DM Sans', fontSize: '10px', color: '#6F7876', margin: '4px 0 0'}}>
                                {partnerDate}
                              </p>
                            </>
                          ) : (
                            <div style={{
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.06)',
                              borderRadius: '12px 12px 12px 2px',
                              padding: '12px 16px',
                              maxWidth: '65%'
                            }}>
                              <p style={{margin: 0, fontFamily: 'DM Sans', fontSize: '14px', color: '#F5F7F7', lineHeight: 1.5}}>
                                {pc.partnerResponse.text}
                              </p>
                              <p style={{margin: '4px 0 0', fontFamily: 'DM Sans', fontSize: '10px', color: '#6F7876'}}>
                                {partnerDate}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </>
            ) : (
              <>
                <div style={{
                  textAlign: 'center',
                  color: '#6F7876',
                  fontSize: '12px',
                  fontFamily: 'DM Sans',
                  marginBottom: '20px'
                }}>
                  No hay historial de conversaciones
                </div>
              </>
            )}
            <div ref={messagesBottomRef} style={{height: '1px'}} />
          </div>

          {/* Input */}
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <span style={{
                fontFamily: 'DM Sans', fontSize: '11px',
                color: '#6F7876', textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}>Mensaje</span>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <span style={{fontFamily: 'DM Sans', fontSize: '12px', color: '#6F7876'}}>
                  Usar predeterminado
                </span>
                <Toggle value={usarPredeterminado} onChange={setUsarPredeterminado} />
              </div>
            </div>

            {/* AI Explanation */}
            <div style={{
              background: 'rgba(176,255,146,0.05)',
              border: '1px solid rgba(176,255,146,0.1)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}>
              <Sparkles size={14} style={{color: '#B0FF92', marginTop: '2px', flexShrink: 0}}/>
              <p style={{
                margin: 0,
                fontFamily: 'DM Sans',
                fontSize: '12px',
                color: '#6F7876',
                lineHeight: 1.5
              }}>
                El mensaje es generado por IA con el contexto
                de esta oportunidad. Puedes editarlo antes de enviar.
              </p>
            </div>

            {/* Partner Email */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <Mail size={13} style={{color: '#6F7876'}}/>
              <span style={{
                fontFamily: 'DM Sans',
                fontSize: '12px',
                color: '#6F7876'
              }}>
                Enviar a:
              </span>
              <span style={{
                fontFamily: 'DM Sans',
                fontSize: '12px',
                color: '#A3AEAC'
              }}>
                {op?.partner?.toLowerCase().replace(/\s+/g, '.')}@example.com
              </span>
            </div>

            <textarea
              placeholder="Escribe un mensaje..."
              value={usarPredeterminado ? getDefaultMessage(op) : mensajeChat}
              onChange={(e) => {
                if (!usarPredeterminado) setMensajeChat(e.target.value)
              }}
              readOnly={usarPredeterminado}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#F5F7F7',
                fontFamily: 'DM Sans',
                fontSize: '14px',
                resize: 'none',
                minHeight: '100px',
                maxHeight: '160px',
                overflowY: 'auto',
                boxSizing: 'border-box',
                opacity: usarPredeterminado ? 0.7 : 1,
                cursor: usarPredeterminado ? 'default' : 'text'
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '8px'
            }}>
              <button
                onClick={() => {
                  const mensaje = usarPredeterminado
                    ? getDefaultMessage(op)
                    : mensajeChat

                  if (!mensaje) return

                  const pulseCheck = {
                    id: `pulse_${op.id}_${Date.now()}`,
                    date: new Date().toISOString().slice(0,10),
                    type: usarPredeterminado ? 'auto' : 'manual',
                    sentBy: 'Carlos',
                    message: mensaje,
                    status: 'enviado'
                  }

                  enviarPulseCheck(op.id, pulseCheck)

                  if (op.estado === 'nueva') {
                    cambiarEstado(op.id, 'esperando')
                  }

                  setMensajeChat('')
                }}
                style={{
                  background: '#B0FF92',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  color: '#121716',
                  fontFamily: 'DM Sans',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Enviar Pulse Check
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CustomDropdown({ value, onChange, options }) {
  const [open, setOpen] = useState(false)
  const selected = options.find(o => o.value === value)

  return (
    <div style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 8,
          padding: '10px 14px',
          color: '#F5F7F7',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 14,
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>{selected ? selected.label : '—'}</span>
        <ChevronDown
          size={14}
          color="#6F7876"
          strokeWidth={1.5}
          style={{ transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
        />
      </div>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: '#1A1F1E',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
            zIndex: 9999,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            overflow: 'hidden',
          }}>
            {options.map(opt => (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                style={{
                  padding: '10px 14px',
                  color: opt.value === value ? '#B0FF92' : '#A3AEAC',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'background 0.1s, color 0.1s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.color = '#F5F7F7'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = opt.value === value ? '#B0FF92' : '#A3AEAC'
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function PulseSchedule({ op, onToggle }) {
  const [frecuencia, setFrecuencia] = useState('7')
  const [fechaPersonalizada, setFechaPersonalizada] = useState('')
  const [repetirCada, setRepetirCada] = useState('7')

  function calcularProximoEnvio() {
    if (frecuencia === 'personalizado') {
      return fechaPersonalizada ? formatFechaLarga(fechaPersonalizada) : '—'
    }
    const d = new Date()
    d.setDate(d.getDate() + parseInt(frecuencia))
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const fieldLabelStyle = {
    fontSize: 11, color: '#6F7876', margin: '0 0 6px',
    fontFamily: 'DM Sans, sans-serif',
    textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500,
  }

  const dateInputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#F5F7F7',
    fontSize: 13,
    padding: '8px 12px',
    outline: 'none',
    fontFamily: 'DM Sans, sans-serif',
    colorScheme: 'dark',
    boxSizing: 'border-box',
  }

  return (
    <Section title="Automatización">
      {/* Toggle row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <p style={{ fontSize: 13, color: '#F5F7F7', margin: 0, fontWeight: 500, fontFamily: 'DM Sans, sans-serif' }}>
          Pulse Check automático
        </p>
        <Toggle value={op.automatico} onChange={onToggle} />
      </div>

      {/* Expanded options when ON */}
      {op.automatico && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Frequency selector */}
          <div>
            <p style={fieldLabelStyle}>Enviar cada</p>
            <CustomDropdown
              value={frecuencia}
              onChange={setFrecuencia}
              options={[
                { value: '7', label: '7 días' },
                { value: '14', label: '14 días' },
                { value: '30', label: '30 días' },
                { value: 'personalizado', label: 'Personalizado' },
              ]}
            />
          </div>

          {/* Custom date block */}
          {frecuencia === 'personalizado' && (
            <div style={{
              padding: '14px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10,
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              <div>
                <p style={fieldLabelStyle}>Próximo Pulse Check</p>
                <input
                  type="date"
                  value={fechaPersonalizada}
                  onChange={e => setFechaPersonalizada(e.target.value)}
                  style={dateInputStyle}
                />
              </div>
              <div>
                <p style={fieldLabelStyle}>A partir de esa fecha, ¿repetir cada?</p>
                <CustomDropdown
                  value={repetirCada}
                  onChange={setRepetirCada}
                  options={[
                    { value: '7', label: '7 días' },
                    { value: '14', label: '14 días' },
                    { value: '30', label: '30 días' },
                    { value: 'no_repetir', label: 'No repetir' },
                  ]}
                />
              </div>
            </div>
          )}

          {/* Next send */}
          <p style={{ fontSize: 12, color: '#6F7876', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
            Próximo envío:{' '}
            <span style={{ fontFamily: 'Satoshi, sans-serif', fontWeight: 700, color: '#A3AEAC' }}>
              {calcularProximoEnvio()}
            </span>
          </p>
        </div>
      )}
    </Section>
  )
}

function Section({ title, children }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12,
      padding: '20px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    }}>
      <h3
        className="font-clash"
        style={{ fontSize: 14, fontWeight: 600, color: '#F5F7F7', margin: '0 0 16px', letterSpacing: '0.01em', textTransform: 'uppercase', opacity: 0.6 }}
      >
        {title}
      </h3>
      {children}
    </div>
  )
}

function computePartnerStats(op, oportunidades) {
  const partnerOps = oportunidades.filter(o => o.partner === op.partner)

  const activas = partnerOps.filter(o => o.estado !== 'ganada' && o.estado !== 'perdida').length
  const sinRespuesta = partnerOps.filter(o => o.estado === 'sin_respuesta').length

  const pulseChecks = partnerOps.flatMap(o => o.pulseChecks)
  const respondidos = pulseChecks.filter(pc => pc.estado === 'Respondido')

  const ultimaRespuesta = respondidos.reduce((latest, pc) => {
    const d = new Date(pc.fecha + 'T00:00:00')
    return !latest || d > latest ? d : latest
  }, null)
  const diasUltimaRespuesta = ultimaRespuesta
    ? Math.max(0, Math.floor((Date.now() - ultimaRespuesta.getTime()) / 86400000))
    : null

  const tasaRespuesta = pulseChecks.length > 0
    ? Math.round((respondidos.length / pulseChecks.length) * 100)
    : 0

  return { activas, sinRespuesta, diasUltimaRespuesta, tasaRespuesta }
}

function PartnerPerformanceSection({ op, oportunidades }) {
  const navigate = useNavigate()
  const { activas, sinRespuesta, diasUltimaRespuesta, tasaRespuesta } = computePartnerStats(op, oportunidades)
  const tasaColor = tasaRespuesta >= 70 ? '#B0FF92' : tasaRespuesta >= 40 ? '#F5B942' : '#F97316'

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12,
      padding: '20px 24px',
    }}>
      <h3 className="font-clash" style={{ fontSize: 16, fontWeight: 700, color: '#F5F7F7', margin: '0 0 4px' }}>
        Sobre este partner
      </h3>
      <p style={{ fontSize: 12, color: '#6F7876', margin: '0 0 20px', fontFamily: 'DM Sans, sans-serif' }}>
        Rendimiento de {op.partner} en tu pipeline
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 18 }}>
        <PartnerMetric label="Activas" value={activas} color="#F5F7F7" />
        <PartnerMetric label="Sin respuesta" value={sinRespuesta} color={sinRespuesta >= 1 ? '#F97316' : '#F5F7F7'} />
        <PartnerMetric
          label="Última respuesta"
          value={diasUltimaRespuesta != null ? `hace ${diasUltimaRespuesta} día${diasUltimaRespuesta !== 1 ? 's' : ''}` : 'Sin respuestas aún'}
          text
        />
        <PartnerMetric label="Tasa de respuesta" value={`${tasaRespuesta}%`} color={tasaColor} />
      </div>

      <button
        onClick={() => navigate('/partners', { state: { partnerFilter: op.partner } })}
        style={{
          display: 'block',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          color: '#B0FF92', fontSize: 13, fontFamily: 'DM Sans, sans-serif',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.8' }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
      >
        Ver rendimiento completo del partner →
      </button>
    </div>
  )
}

function PartnerMetric({ label, value, color, text = false }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: '#6F7876', margin: '0 0 6px', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>
        {label}
      </p>
      {text ? (
        <p style={{ fontSize: 13, color: '#A3AEAC', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
          {value}
        </p>
      ) : (
        <p className="font-clash" style={{ fontSize: 20, fontWeight: 700, color, margin: 0, lineHeight: 1 }}>
          {value}
        </p>
      )}
    </div>
  )
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: '#6F7876', margin: '0 0 4px', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>
        {label}
      </p>
      <div style={{ fontSize: 14, color: '#F5F7F7', fontFamily: 'DM Sans, sans-serif', fontWeight: 400 }}>
        {value}
      </div>
    </div>
  )
}

function StatusBadge({ config }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7,
      padding: '6px 14px',
      background: config.bg,
      border: `1px solid ${config.color}`,
      borderRadius: 20,
      flexShrink: 0,
      boxShadow: `0 0 12px rgba(${hexToRgb(config.color)},0.3), inset 0 0 8px rgba(${hexToRgb(config.color)},0.05)`,
    }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: config.dot, boxShadow: `0 0 8px ${config.dot}` }} />
      <span style={{ fontSize: 13, fontWeight: 700, color: config.color, fontFamily: 'Satoshi, sans-serif' }}>
        {config.label}
      </span>
    </div>
  )
}

function ActionButton({ icon: Icon, label, onClick, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 9,
        padding: '10px 14px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 9,
        color: '#A3AEAC',
        fontSize: 13,
        cursor: 'pointer',
        fontFamily: 'DM Sans, sans-serif',
        width: '100%',
        textAlign: 'left',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `rgba(${hexToRgb(color)},0.08)`
        e.currentTarget.style.borderColor = `rgba(${hexToRgb(color)},0.2)`
        e.currentTarget.style.color = color
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
        e.currentTarget.style.color = '#A3AEAC'
      }}
    >
      <Icon size={15} strokeWidth={1.5} />
      {label}
    </button>
  )
}

const cancelBtnStyle = {
  fontSize: 12, padding: '6px 12px', borderRadius: 7,
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'transparent', color: '#A3AEAC', cursor: 'pointer',
  fontFamily: 'DM Sans, sans-serif',
}

const saveBtnStyle = {
  fontSize: 12, padding: '6px 12px', borderRadius: 7,
  border: '1px solid rgba(176,255,146,0.2)',
  background: 'rgba(176,255,146,0.1)',
  color: '#B0FF92', cursor: 'pointer',
  fontWeight: 500,
  fontFamily: 'DM Sans, sans-serif',
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`
    : '255,255,255'
}
