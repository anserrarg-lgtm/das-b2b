import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { MoreHorizontal, Send, StickyNote, Eye, CheckCircle, XCircle, PauseCircle, PlayCircle, ChevronLeft, ChevronRight, Building2, FileText, DollarSign, Clock } from 'lucide-react'
import { ESTADO_CONFIG } from '../../data/mockData'
import { useApp } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'

function formatValor(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function formatFecha(str) {
  const d = new Date(str + 'T00:00:00')
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

function formatDiasAtras(str) {
  const d = new Date(str + 'T00:00:00')
  const hoy = new Date()
  const dias = Math.floor((hoy - d) / (1000 * 60 * 60 * 24))
  if (dias === 0) return 'hoy'
  if (dias === 1) return 'hace 1 día'
  return `hace ${dias} días`
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`
    : '255,255,255'
}

function formatShortDate(dateStr) {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length !== 3) return ''
  const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

function getStatusBadgeColors(estado) {
  const colors = {
    'nueva': { bg: 'rgba(255,255,255,0.15)', border: 'rgba(255,255,255,0.25)', color: '#C8CDD0' },
    'sin_respuesta': { bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.4)', color: '#F97316' },
    'esperando': { bg: 'rgba(123,88,248,0.15)', border: 'rgba(123,88,248,0.4)', color: '#7B58F8' },
    'respondida': { bg: 'rgba(176,255,146,0.15)', border: 'rgba(176,255,146,0.4)', color: '#B0FF92' },
    'venta_confirmada': { bg: 'rgba(95,191,249,0.15)', border: 'rgba(95,191,249,0.4)', color: '#5FBFF9' },
  }
  return colors[estado] || { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)', color: '#A3AEAC' }
}

function getDefaultMessageForStatus(estado, cliente) {
  if (estado === 'respondida') {
    return `Entendido, ¿hay algo en lo que podamos apoyarte para avanzar con ${cliente}?`
  }
  if (estado === 'sin_respuesta') {
    return `Hola, llevamos un tiempo sin noticias sobre ${cliente}. ¿Sigue activa esta oportunidad? Nos interesa saber si hay algo que esté bloqueando el proceso.`
  }
  if (estado === 'esperando') {
    return `Hola, retomamos el contacto sobre ${cliente}. ¿Pudiste avanzar con ellos?`
  }
  return `Hola, ¿cómo va el proceso con ${cliente}?`
}

export default function OpportunityCard({ oportunidad }) {
  const menuId = useRef(Math.random().toString())
  const [isOpen, setIsOpen] = useState(false)
  const [noteMode, setNoteMode] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [enEsperaMode, setEnEsperaMode] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [esperaFecha, setEsperaFecha] = useState('')
  const [calendarMes, setCalendarMes] = useState(new Date().getMonth())
  const [calendarAño, setCalendarAño] = useState(new Date().getFullYear())
  const [esperaMotivo, setEsperaMotivo] = useState('')
  const [enviarPulseAlReactivar, setEnviarPulseAlReactivar] = useState(true)
  const [aiSummary, setAiSummary] = useState('')
  const [loadingSummary, setLoadingSummary] = useState(false)

  useEffect(() => {
    const handleClose = (e) => {
      if (e.detail !== menuId.current) {
        setIsOpen(false)
      }
    }
    window.addEventListener('closeMenus', handleClose)
    return () => window.removeEventListener('closeMenus', handleClose)
  }, [])

  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  useEffect(() => {
    const generateSummary = async () => {
      if (!oportunidad.pulseChecks || oportunidad.pulseChecks.length === 0) return

      console.log('Generating summary for:', oportunidad.cliente, 'pulseChecks:', oportunidad.pulseChecks?.length)
      setLoadingSummary(true)
      try {
        const lastMessages = oportunidad.pulseChecks.slice(-2).map(pc => {
          let msg = `CAM: ${pc.message}`
          if (pc.partnerResponse) {
            msg += `\nPartner: ${pc.partnerResponse.text || pc.partnerResponse.type}`
          }
          return msg
        }).join('\n')

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 100,
            system: 'Eres un asistente de ventas B2B. Resume en máximo 15 palabras el estado actual de esta oportunidad basándote en la conversación. Solo el resumen, sin explicaciones.',
            messages: [{
              role: 'user',
              content: `Conversación:\n${lastMessages}\nEstado: ${oportunidad.estado}`
            }]
          })
        })
        const data = await response.json()
        console.log('API response:', data)
        setAiSummary(data.content[0].text)
      } catch(e) {
        console.error(e)
      } finally {
        setLoadingSummary(false)
      }
    }
    generateSummary()
  }, [oportunidad.id])

  const { enviarPulseCheck, agregarNota, setSelectedOportunidad, cerrarComoGanada, cerrarComoPerdida, ponerEnEspera, salirDeEspera, cambiarEstado } = useApp()
  const navigate = useNavigate()

  const config = ESTADO_CONFIG[oportunidad.estado]
  const cardColor = oportunidad.enEspera ? '#5FBFF9' : config.color
  const rgb = hexToRgb(cardColor)

  const baseStyle = {
    width: '100%',
    boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: '20px 16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
  }

  const hoverBorder = oportunidad.enEspera ? '1px solid rgba(139,155,173,0.6)' : `1px solid rgba(${rgb},0.6)`
  const hoverShadow = oportunidad.enEspera ? '0 0 16px rgba(139,155,173,0.15)' : `0 0 16px rgba(${rgb},0.2)`

  function handleMenuAction(action) {
    setIsOpen(false)
    if (action === 'pulse') {
      const pulseCheck = {
        id: `pulse_${oportunidad.id}_${Date.now()}`,
        date: new Date().toISOString().slice(0,10),
        type: 'manual',
        sentBy: 'Carlos',
        message: getDefaultMessageForStatus(oportunidad.estado, oportunidad.cliente),
        status: 'enviado'
      }
      enviarPulseCheck(oportunidad.id, pulseCheck)
      if (oportunidad.estado === 'nueva') {
        cambiarEstado(oportunidad.id, 'esperando')
      }
      setSelectedOportunidad(oportunidad)
      navigate(`/oportunidad/${oportunidad.id}`, {
        state: { openPulseChat: true }
      })
    }
    if (action === 'nota') setNoteMode(true)
    if (action === 'espera') setEnEsperaMode(true)
    if (action === 'salir-espera') {
      salirDeEspera(oportunidad.id)
    }
    if (action === 'detalle') {
      setSelectedOportunidad(oportunidad)
      navigate(`/oportunidad/${oportunidad.id}`)
    }
    if (action === 'ganada') {
      setConfirmAction('ganada')
      setSelectedOportunidad(oportunidad)
    }
    if (action === 'perdida' || action === 'descalificada') {
      setConfirmAction('descalificada')
      setSelectedOportunidad(oportunidad)
    }
  }

  function handleNoteSubmit(e) {
    e.preventDefault()
    if (noteText.trim()) {
      agregarNota(oportunidad.id, noteText.trim())
      setNoteText('')
      setNoteMode(false)
    }
  }

  return (
    <div
      style={{ ...baseStyle, ...(isOpen ? { zIndex: 100 } : {}) }}
      onClick={() => {
        if (confirmAction) return
        setSelectedOportunidad(oportunidad)
        navigate(`/oportunidad/${oportunidad.id}`)
      }}
      onMouseEnter={e => {
        e.currentTarget.style.border = hoverBorder
        e.currentTarget.style.boxShadow = hoverShadow
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* 1. Opportunity name + menu */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 0 }}>
        <p className="font-clash" style={{
          fontSize: 15,
          fontWeight: 700,
          color: '#F5F7F7',
          margin: '0 0 2px',
          lineHeight: 1.2,
          flex: 1,
        }}>
          {oportunidad.cliente}
        </p>
        <div style={{ position: 'relative', marginLeft: 8 }} onClick={e => e.stopPropagation()}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              window.dispatchEvent(new CustomEvent('closeMenus', { detail: menuId.current }))
              setIsOpen(prev => !prev)
            }}
            style={{
              width: 24, height: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 4,
              border: 'none',
              background: 'transparent',
              color: '#6F7876',
              cursor: 'pointer',
              transition: 'all 0.1s',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.color = '#A3AEAC'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#6F7876'
            }}
          >
            <MoreHorizontal size={14} strokeWidth={2} />
          </button>
          {isOpen && (
            <CardMenu oportunidad={oportunidad} onAction={handleMenuAction} onClose={() => setIsOpen(false)} />
          )}
        </div>
      </div>

      {/* 3. Partner name */}
      <p style={{ fontSize: 13, color: '#A3AEAC', fontFamily: 'DM Sans, sans-serif', margin: '0 0 14px' }}>
        {oportunidad.partner}
      </p>

      {/* 3.8 Product info + Contract type badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <p style={{ fontSize: 13, color: '#6F7876', fontFamily: 'DM Sans', margin: '0 0 2px' }}>
            {oportunidad.producto}
          </p>
          <p style={{ fontSize: 12, color: '#6F7876', fontFamily: 'DM Sans', margin: 0 }}>
            {oportunidad.cantidad}
          </p>
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '3px 8px',
          background: getStatusBadgeColors(oportunidad.estado).bg,
          border: `1px solid ${getStatusBadgeColors(oportunidad.estado).border}`,
          borderRadius: 4,
          fontSize: 11,
          color: getStatusBadgeColors(oportunidad.estado).color,
          fontFamily: 'DM Sans, sans-serif',
          flexShrink: 0,
          alignSelf: 'flex-start'
        }}>
          {oportunidad.tipoContrato}
        </div>
      </div>

      {/* 4. Value */}
      <p style={{
        fontSize: 16,
        fontWeight: 700,
        color: '#F5F7F7',
        fontFamily: 'Satoshi, sans-serif',
        margin: '0 0 8px',
        letterSpacing: '-0.01em'
      }}>
        {formatValor(oportunidad.valor)}
      </p>

      {/* 4.5 Summary */}
      {oportunidad.resumen ? (
        <p style={{
          fontSize: 12,
          color: '#6F7876',
          fontFamily: 'DM Sans',
          margin: '0 0 14px',
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {oportunidad.resumen}
        </p>
      ) : aiSummary ? (
        <p style={{
          fontSize: 12,
          color: '#6F7876',
          fontFamily: 'DM Sans',
          margin: '0 0 14px',
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {aiSummary}
        </p>
      ) : null}

      {/* 5. Bottom row: Status-specific date display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {oportunidad.estado === 'nueva' && (
          <span style={{ fontSize: 11, color: '#6F7876', fontFamily: 'DM Sans, sans-serif' }}>
            {formatFecha(oportunidad.ultimaActividad)}
          </span>
        )}

        {oportunidad.estado === 'sin_respuesta' && (() => {
          const daysWithoutResponse = oportunidad.daysSinceResponse ||
            Math.floor((new Date() - new Date(oportunidad.ultimaActividad)) / (1000 * 60 * 60 * 24))
          return (
            <span style={{ fontSize: 11, color: '#F97316', fontFamily: 'DM Sans, sans-serif' }}>
              {daysWithoutResponse} días sin respuesta
            </span>
          )
        })()}

        {oportunidad.estado === 'esperando' && (() => {
          const lastPulseDate = oportunidad.pulseChecks?.[oportunidad.pulseChecks.length - 1]?.date
          return (
            <span style={{ fontSize: 11, color: '#7B58F8', fontFamily: 'DM Sans, sans-serif' }}>
              Pulse enviado: {formatShortDate(lastPulseDate || '')}
            </span>
          )
        })()}

        {oportunidad.estado === 'respondida' && (
          <span style={{ fontSize: 11, color: '#B0FF92', fontFamily: 'DM Sans, sans-serif' }}>
            Respondida: {formatFecha(oportunidad.ultimaActividad)}
          </span>
        )}

        {oportunidad.estado === 'venta_confirmada' && (() => {
          const periodoAtribucion = parseInt(localStorage.getItem('periodoAtribucion') || '60')
          const fechaConfirmacion = oportunidad.pulseChecks?.[oportunidad.pulseChecks.length - 1]?.partnerResponse?.date
          const diasTranscurridos = fechaConfirmacion
            ? Math.floor((new Date() - new Date(fechaConfirmacion)) / (1000 * 60 * 60 * 24))
            : 0
          const diasRestantes = periodoAtribucion - diasTranscurridos

          let colorVencimiento = '#5FBFF9'
          let textoVencimiento = `Vence en ${diasRestantes} días`

          if (diasRestantes <= 0) {
            colorVencimiento = '#FF6B6B'
            textoVencimiento = 'Período vencido'
          }

          return (
            <span style={{ fontSize: 11, color: colorVencimiento, fontFamily: 'DM Sans, sans-serif' }}>
              {textoVencimiento}
            </span>
          )
        })()}

        {oportunidad.enEspera && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 8px',
            background: 'rgba(139,155,173,0.1)',
            border: '1px solid rgba(139,155,173,0.2)',
            borderRadius: 4,
            fontSize: 11,
            color: '#8B9BAD',
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 500
          }}>
            <PauseCircle size={12} strokeWidth={2} color="#8B9BAD" />
            Esperando
          </div>
        )}
      </div>

      {/* Inline note mode */}
      {noteMode && (
        <form
          onSubmit={handleNoteSubmit}
          onClick={e => e.stopPropagation()}
          style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}
        >
          <textarea
            autoFocus
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="Escribe una nota..."
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(176,255,146,0.2)',
              borderRadius: 8,
              color: '#F5F7F7',
              fontSize: 12,
              padding: '8px 10px',
              resize: 'none',
              outline: 'none',
              fontFamily: 'DM Sans, sans-serif',
              minHeight: 60,
            }}
          />
          <div style={{ display: 'flex', gap: 6, marginTop: 6, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setNoteMode(false)}
              style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#A3AEAC', cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: 'none', background: 'rgba(176,255,146,0.15)', color: '#B0FF92', cursor: 'pointer', fontWeight: 500 }}
            >
              Guardar
            </button>
          </div>
        </form>
      )}

      {/* Confirmation modal for close actions */}
      {confirmAction && createPortal(
        <div
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
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
            <p style={{ fontSize: 13, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', margin: '0 0 6px', lineHeight: 1.5 }}>
              <span style={{ color: '#A3AEAC', fontWeight: 500 }}>{oportunidad.cliente}</span>
            </p>
            <p style={{ fontSize: 13, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', margin: '0 0 24px', lineHeight: 1.6 }}>
              {confirmAction === 'ganada'
                ? 'Esta oportunidad se moverá al Historial y contará para tu bono del período actual.'
                : 'Esta oportunidad se moverá al Historial. Puedes encontrarla ahí cuando quieras.'}
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
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  if (confirmAction === 'ganada') cerrarComoGanada(oportunidad.id)
                  else cerrarComoPerdida(oportunidad.id)
                  setConfirmAction(null)
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

      {/* En espera modal */}
      {enEsperaMode && createPortal(
        <div
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setEnEsperaMode(false)}
        >
          {oportunidad.enEspera ? (
            // Already in espera - show different modal
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
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#F5F7F7', margin: '0 0 8px', fontFamily: "'Satoshi', sans-serif" }}>
                Esta oportunidad ya está en espera
              </h2>
              <p style={{ fontSize: 13, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', margin: '0 0 24px' }}>
                Está pausada hasta el {new Date(oportunidad.enEsperaHasta + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                <button
                  onClick={() => {
                    setEnEsperaMode(false)
                    // TODO: Open date picker to update espera date
                  }}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'transparent',
                    color: '#A3AEAC',
                    fontSize: 13,
                    fontFamily: 'DM Sans, sans-serif',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#F5F7F7'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#A3AEAC'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                >
                  Cambiar fecha
                </button>
                <button
                  onClick={() => {
                    // Remove from espera - reactivate to previous status
                    ponerEnEspera(oportunidad.id, null, null, false)
                    setEnEsperaMode(false)
                  }}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 8,
                    border: '1px solid rgba(249,115,22,0.3)',
                    background: 'transparent',
                    color: '#F97316',
                    fontSize: 13,
                    fontFamily: 'DM Sans, sans-serif',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.6)'; e.currentTarget.style.background = 'rgba(249,115,22,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)'; e.currentTarget.style.background = 'transparent' }}
                >
                  Quitar de espera
                </button>
              </div>
              <button
                onClick={() => setEnEsperaMode(false)}
                style={{ width: '100%', padding: '10px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#A3AEAC', fontSize: 13, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#F5F7F7'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#A3AEAC'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
              >
                Cancelar
              </button>
            </div>
          ) : (
            // Normal poner en espera modal
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
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#F5F7F7', margin: '0 0 24px', fontFamily: "'Satoshi', sans-serif" }}>
                Poner en espera
              </h2>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 10, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                  Reactivar el
                </label>
                <CalendarPicker
                  selectedDate={esperaFecha}
                  onDateSelect={setEsperaFecha}
                  currentMonth={calendarMes}
                  currentYear={calendarAño}
                  onMonthChange={setCalendarMes}
                  onYearChange={setCalendarAño}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 10, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                  Motivo (opcional)
                </label>
                <input
                  type="text"
                  value={esperaMotivo}
                  onChange={e => setEsperaMotivo(e.target.value)}
                  placeholder="ej. El cliente decide en julio"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#F5F7F7', fontSize: 13, padding: '9px 12px', outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, color: '#F5F7F7', fontFamily: "'Satoshi', sans-serif", fontWeight: 500, margin: '0 0 4px' }}>
                      ¿Enviar Pulse Check al reactivarse?
                    </p>
                    <p style={{ fontSize: 12, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', margin: 0, lineHeight: 1.5 }}>
                      Cuando termine el período de espera Beacon le enviará automáticamente un mensaje al partner
                    </p>
                  </div>
                  <div style={{ flexShrink: 0, marginTop: 2 }}>
                    <button
                      onClick={() => setEnviarPulseAlReactivar(!enviarPulseAlReactivar)}
                      style={{
                        width: '36px',
                        height: '20px',
                        borderRadius: '10px',
                        background: enviarPulseAlReactivar ? '#B0FF92' : 'rgba(255,255,255,0.1)',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background 0.2s ease',
                        border: 'none',
                        padding: 0,
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: '3px',
                        left: enviarPulseAlReactivar ? '19px' : '3px',
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: enviarPulseAlReactivar ? '#121716' : '#A3AEAC',
                        transition: 'left 0.2s ease'
                      }}/>
                    </button>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setEnEsperaMode(false)}
                  style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#A3AEAC', fontSize: 13, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#F5F7F7'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#A3AEAC'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!esperaFecha) return
                    ponerEnEspera(oportunidad.id, esperaFecha, esperaMotivo)
                    setEsperaFecha('')
                    setCalendarMes(new Date().getMonth())
                    setCalendarAño(new Date().getFullYear())
                    setEsperaMotivo('')
                    setEnEsperaMode(false)
                  }}
                  style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#B0FF92', color: '#121716', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', transition: 'opacity 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.88' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                >
                  Confirmar
                </button>
              </div>
            </div>
          )}
        </div>,
        document.body
      )}

      {confirmAction && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0,
          width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.75)',
          zIndex: 99999,
          display: 'flex', alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '440px',
            background: 'rgba(18,23,22,0.97)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '28px',
            backdropFilter: 'blur(24px)'
          }}>
            <p style={{fontSize: '18px', fontFamily: 'Satoshi',
              fontWeight: 700, color: '#F5F7F7', margin: '0 0 8px'}}>
              {confirmAction === 'ganada' ? '¿Cerrar como ganada?' : '¿Descalificar esta oportunidad?'}
            </p>
            <p style={{fontSize: '13px', fontFamily: 'DM Sans',
              color: '#6F7876', margin: '0 0 24px'}}>
              {confirmAction === 'ganada'
                ? 'Esta oportunidad se moverá al Historial y contará para tu bono del período actual.'
                : 'Esta oportunidad se moverá al Historial. Puedes encontrarla ahí cuando quieras.'}
            </p>
            <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
              <button onClick={(e) => {
                e.stopPropagation()
                setConfirmAction(null)
              }}
                style={{padding: '8px 16px', background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', color: '#A3AEAC',
                  cursor: 'pointer', fontFamily: 'DM Sans'}}>
                Cancelar
              </button>
              <button onClick={() => {
                if (confirmAction === 'ganada') cerrarComoGanada(oportunidad.id)
                else cerrarComoPerdida(oportunidad.id)
                setConfirmAction(null)
              }}
                style={{padding: '8px 16px', background: '#B0FF92',
                  border: 'none', borderRadius: '8px',
                  color: '#121716', cursor: 'pointer',
                  fontFamily: 'DM Sans', fontWeight: 500}}>
                Confirmar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

function CalendarPicker({ selectedDate, onDateSelect, currentMonth, currentYear, onMonthChange, onYearChange }) {
  const today = new Date()
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const diasSemana = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDay = new Date(currentYear, currentMonth, 1).getDay()
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1

  const days = []
  for (let i = 0; i < adjustedFirstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      onMonthChange(11)
      onYearChange(currentYear - 1)
    } else {
      onMonthChange(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      onMonthChange(0)
      onYearChange(currentYear + 1)
    } else {
      onMonthChange(currentMonth + 1)
    }
  }

  const handleDayClick = (day) => {
    if (day) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      onDateSelect(dateStr)
    }
  }

  const isPastDay = (day) => {
    if (!day) return false
    const clickedDate = new Date(currentYear, currentMonth, day)
    return clickedDate < today
  }

  const isToday = (day) => {
    if (!day) return false
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
  }

  const isSelected = (day) => {
    if (!day || !selectedDate) return false
    const [selectedYear, selectedMonth, selectedDay] = selectedDate.split('-').map(Number)
    return day === selectedDay && currentMonth === selectedMonth - 1 && currentYear === selectedYear
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 10,
      padding: 16,
      width: '100%',
      boxSizing: 'border-box',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button
          onClick={handlePrevMonth}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A3AEAC', padding: 0 }}
        >
          <ChevronLeft size={18} strokeWidth={2} />
        </button>
        <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Satoshi', sans-serif", color: '#F5F7F7' }}>
          {meses[currentMonth]} {currentYear}
        </span>
        <button
          onClick={handleNextMonth}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A3AEAC', padding: 0 }}
        >
          <ChevronRight size={18} strokeWidth={2} />
        </button>
      </div>

      {/* Days of week */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
        {diasSemana.map(dia => (
          <div key={dia} style={{ textAlign: 'center', fontSize: 11, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', padding: 8 }}>
            {dia}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {days.map((day, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation()
              handleDayClick(day)
            }}
            disabled={day === null || isPastDay(day)}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: isToday(day) ? '1px solid rgba(255,255,255,0.2)' : 'none',
              background: isSelected(day) ? '#B0FF92' : 'transparent',
              color: isSelected(day) ? '#121716' : isPastDay(day) ? '#3D4F6E' : '#A3AEAC',
              fontSize: 13,
              fontFamily: 'DM Sans, sans-serif',
              cursor: day === null || isPastDay(day) ? 'not-allowed' : 'pointer',
              padding: 0,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              if (day && !isPastDay(day)) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.color = '#F5F7F7'
              }
            }}
            onMouseLeave={e => {
              if (!isSelected(day)) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = isPastDay(day) ? '#3D4F6E' : '#A3AEAC'
              }
            }}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Selected date display */}
      {selectedDate && (
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontSize: 13, color: '#A3AEAC', fontFamily: 'DM Sans, sans-serif', margin: 0 }}>
            Reactivar el {(() => {
              const [year, month, day] = selectedDate.split('-').map(Number)
              return `${day} de ${meses[month - 1]} de ${year}`
            })()}
          </p>
        </div>
      )}
    </div>
  )
}

function CardMenu({ oportunidad, onAction, onClose }) {
  const items = [
    { action: 'pulse',   icon: Send,        label: 'Enviar Pulse Check',  color: '#A3AEAC' },
    { action: 'nota',    icon: StickyNote,  label: 'Agregar nota',        color: '#A3AEAC' },
    ...(oportunidad.enEspera
      ? [{ action: 'salir-espera', icon: PlayCircle, label: 'Salir de espera', color: '#A3AEAC' }]
      : [{ action: 'espera',  icon: PauseCircle, label: 'Poner en espera',     color: '#A3AEAC' }]
    ),
    { action: 'detalle', icon: Eye,         label: 'Ver detalles',        color: '#A3AEAC' },
    { divider: true },
    { action: 'ganada',  icon: CheckCircle, label: 'Cerrar como ganada',  color: '#B0FF92' },
    { action: 'perdida', icon: XCircle,     label: 'Descalificar',        color: '#A3AEAC' },
  ]

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={onClose} />
      <div style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        zIndex: 9999,
        marginTop: 4,
        background: 'rgba(20,26,25,0.97)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
        padding: 4,
        width: 185,
        boxShadow: '0 16px 40px rgba(0,0,0,0.55)',
      }}>
        {items.map((item, i) => {
          if (item.divider) {
            return (
              <div key={`div-${i}`} style={{
                height: 1,
                background: 'rgba(255,255,255,0.06)',
                margin: '3px 6px',
              }} />
            )
          }
          const Icon = item.icon
          const baseColor = item.color
          const hoverBg   = 'rgba(255,255,255,0.04)'
          const hoverColor= item.color
          return (
            <button
              key={item.action}
              onClick={() => onAction(item.action)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: '8px 10px',
                borderRadius: 7,
                border: 'none',
                background: 'transparent',
                color: baseColor,
                fontSize: 13,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.1s',
                fontFamily: 'DM Sans, sans-serif',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = hoverBg
                e.currentTarget.style.color = hoverColor
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = baseColor
              }}
            >
              <Icon size={14} strokeWidth={1.5} />
              {item.label}
            </button>
          )
        })}
      </div>
    </>
  )
}
