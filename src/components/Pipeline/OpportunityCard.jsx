import { useState } from 'react'
import { createPortal } from 'react-dom'
import { MoreHorizontal, Send, StickyNote, Eye, CheckCircle, XCircle, PauseCircle } from 'lucide-react'
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

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`
    : '255,255,255'
}

export default function OpportunityCard({ oportunidad }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [noteMode, setNoteMode] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [enEsperaMode, setEnEsperaMode] = useState(false)
  const [esperaFecha, setEsperaFecha] = useState('')
  const [esperaMotivo, setEsperaMotivo] = useState('')
  const [confirmAction, setConfirmAction] = useState(null) // null | 'ganada' | 'perdida'
  const { enviarPulseCheck, agregarNota, setSelectedOportunidad, cerrarComoGanada, cerrarComoPerdida, ponerEnEspera } = useApp()
  const navigate = useNavigate()

  const config = ESTADO_CONFIG[oportunidad.estado]
  const cardColor = oportunidad.enEspera ? '#5FBFF9' : config.color
  const rgb = hexToRgb(cardColor)

  const baseStyle = {
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: '14px 16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
  }

  const hoverBorder = `1px solid rgba(${rgb},0.6)`
  const hoverShadow = `0 0 16px rgba(${rgb},0.2)`

  function handleMenuAction(action) {
    setMenuOpen(false)
    if (action === 'pulse') enviarPulseCheck(oportunidad.id)
    if (action === 'nota') setNoteMode(true)
    if (action === 'espera') setEnEsperaMode(true)
    if (action === 'detalle') {
      setSelectedOportunidad(oportunidad)
      navigate(`/oportunidad/${oportunidad.id}`)
    }
    if (action === 'ganada') setConfirmAction('ganada')
    if (action === 'perdida') setConfirmAction('perdida')
  }

  function handleEsperaSubmit(e) {
    e.preventDefault()
    if (!esperaFecha) return
    ponerEnEspera(oportunidad.id, esperaFecha, esperaMotivo.trim())
    setEsperaFecha('')
    setEsperaMotivo('')
    setEnEsperaMode(false)
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
      style={{ ...baseStyle, ...(menuOpen ? { zIndex: 100 } : {}) }}
      onClick={() => {
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
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ flex: 1, marginRight: 8 }}>
          <p className="font-clash" style={{
            fontSize: 14,
            color: '#F5F7F7',
            margin: 0,
            lineHeight: 1.35,
          }}>
            {oportunidad.nombre}
          </p>
          <p className="font-clash" style={{ fontSize: 12, color: '#A3AEAC', margin: '3px 0 0' }}>
            {oportunidad.cliente}
          </p>
        </div>
        <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 6,
              border: '1px solid transparent',
              background: 'transparent',
              color: '#6F7876',
              cursor: 'pointer',
              transition: 'all 0.1s',
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
            <MoreHorizontal size={15} />
          </button>
          {menuOpen && (
            <CardMenu onAction={handleMenuAction} onClose={() => setMenuOpen(false)} />
          )}
        </div>
      </div>

      {/* Status badge + contract */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span className="font-clash" style={{ fontSize: 12, color: '#6F7876' }}>{oportunidad.partner}</span>
        <span style={{
          fontSize: 11,
          color: cardColor,
          background: `rgba(${rgb},0.1)`,
          padding: '2px 8px',
          borderRadius: 4,
          border: `1px solid rgba(${rgb},0.25)`,
          boxShadow: `0 0 6px rgba(${rgb},0.2)`,
          fontWeight: 500,
        }}>
          {oportunidad.tipoContrato}
        </span>
      </div>

      {/* Value */}
      <div style={{ marginBottom: 10 }}>
        <span
          className="font-clash"
          style={{ fontSize: 18, fontWeight: 700, color: '#F5F7F7', letterSpacing: '-0.01em' }}
        >
          {formatValor(oportunidad.valor)}
        </span>
      </div>

      {/* Note preview */}
      {oportunidad.nota && (
        <p style={{
          fontSize: 12,
          color: '#6F7876',
          margin: '0 0 10px',
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {oportunidad.nota}
        </p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: '#6F7876' }}>
          {formatFecha(oportunidad.ultimaActividad)}
        </span>
        {oportunidad.enEspera && oportunidad.enEsperaHasta ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#5FBFF9', background: 'rgba(95,191,249,0.1)', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(95,191,249,0.25)', boxShadow: '0 0 6px rgba(95,191,249,0.2)' }}>
            <PauseCircle size={10} strokeWidth={2} />
            En espera hasta {formatFecha(oportunidad.enEsperaHasta)}
          </span>
        ) : (
          oportunidad.estado === 'sin_respuesta' && oportunidad.diasSinRespuesta > 0 && (
            <span style={{ fontSize: 11, fontWeight: 600, color: '#F97316', background: 'rgba(249,115,22,0.1)', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(249,115,22,0.25)', boxShadow: '0 0 6px rgba(249,115,22,0.2)' }}>
              {oportunidad.diasSinRespuesta}d sin respuesta
            </span>
          )
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
            <p style={{ fontSize: 13, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', margin: '0 0 6px', lineHeight: 1.5 }}>
              <span style={{ color: '#A3AEAC', fontWeight: 500 }}>{oportunidad.nombre}</span>
            </p>
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
          <form
            onSubmit={handleEsperaSubmit}
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
            <p className="font-clash" style={{ fontSize: 18, fontWeight: 700, color: '#5FBFF9', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '-0.02em' }}>
              <PauseCircle size={18} strokeWidth={2} />
              Poner en espera
            </p>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 10, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Reactivar el
              </label>
              <input
                type="date"
                autoFocus
                value={esperaFecha}
                onChange={e => setEsperaFecha(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(95,191,249,0.2)', borderRadius: 8, color: '#F5F7F7', fontSize: 13, padding: '9px 12px', outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', colorScheme: 'dark' }}
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
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setEnEsperaMode(false)}
                style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#A3AEAC', fontSize: 13, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#F5F7F7'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#A3AEAC'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!esperaFecha}
                style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: esperaFecha ? 'rgba(95,191,249,0.2)' : 'rgba(255,255,255,0.04)', color: esperaFecha ? '#5FBFF9' : '#6F7876', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', cursor: esperaFecha ? 'pointer' : 'not-allowed', transition: 'opacity 0.15s' }}
                onMouseEnter={e => { if (esperaFecha) e.currentTarget.style.opacity = '0.88' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              >
                Confirmar
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}
    </div>
  )
}

function CardMenu({ onAction, onClose }) {
  const items = [
    { action: 'pulse',   icon: Send,        label: 'Enviar Pulse Check'  },
    { action: 'nota',    icon: StickyNote,  label: 'Agregar nota'        },
    { action: 'espera',  icon: PauseCircle, label: 'Poner en espera',     color: '#5FBFF9' },
    { action: 'detalle', icon: Eye,         label: 'Ver detalles'        },
    { divider: true },
    { action: 'ganada',  icon: CheckCircle, label: 'Cerrar como ganada',  color: '#B0FF92' },
    { action: 'perdida', icon: XCircle,     label: 'Descalificar',        color: '#FF6B6B' },
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
          const baseColor = item.color || '#A3AEAC'
          const hoverBg   = item.color ? `rgba(${hexToRgb(item.color)},0.08)` : 'rgba(255,255,255,0.06)'
          const hoverColor= item.color || '#F5F7F7'
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
