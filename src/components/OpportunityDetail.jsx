import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, StickyNote, ToggleLeft, ToggleRight, CheckCircle2, CheckCircle, MessageSquare, Clock, Plus, XCircle, MessageCircle, ChevronDown } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { ESTADO_CONFIG } from '../data/mockData'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import PulseCheckPanel from './PulseCheckPanel'

function formatValor(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function formatFechaLarga(str) {
  const d = new Date(str + 'T00:00:00')
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
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
  'Enviado': { color: '#F5B942', bg: 'rgba(245,185,66,0.1)', border: 'rgba(245,185,66,0.2)' },
  'Abierto': { color: '#5FBFF9', bg: 'rgba(95,191,249,0.1)', border: 'rgba(95,191,249,0.2)' },
  'Respondido': { color: '#B0FF92', bg: 'rgba(176,255,146,0.1)', border: 'rgba(176,255,146,0.2)' },
}

export default function OpportunityDetail() {
  const { id } = useParams()
  const { oportunidades, toggleAutomatico, enviarPulseCheck, agregarNota, cerrarComoGanada, cerrarComoPerdida } = useApp()
  const navigate = useNavigate()
  const [noteMode, setNoteMode] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [confirmAction, setConfirmAction] = useState(null) // null | 'ganada' | 'perdida'
  const [pulseCheckPanelOpen, setPulseCheckPanelOpen] = useState(false)
  const [pulseCheckPanelExpanded, setPulseCheckPanelExpanded] = useState(false)

  const op = oportunidades.find(o => o.id === id)

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

  function handleNoteSubmit(e) {
    e.preventDefault()
    if (noteText.trim()) {
      agregarNota(op.id, noteText.trim())
      setNoteText('')
      setNoteMode(false)
    }
  }

  return (
    <div style={{ padding: '32px', maxWidth: 960, margin: '0 auto' }}>
      {/* Back nav */}
      <button
        onClick={() => navigate('/')}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#6F7876', fontSize: 13, fontFamily: 'DM Sans, sans-serif',
          marginBottom: 28, padding: 0,
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#A3AEAC'}
        onMouseLeave={e => e.currentTarget.style.color = '#6F7876'}
      >
        <ArrowLeft size={15} strokeWidth={1.5} />
        Volver al pipeline
      </button>

      {/* Title section */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1
              className="font-clash"
              style={{ fontSize: 30, fontWeight: 700, color: '#F5F7F7', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}
            >
              {op.nombre}
            </h1>
            <p style={{ fontSize: 15, color: '#A3AEAC', margin: '6px 0 0', fontFamily: 'DM Sans, sans-serif' }}>
              {op.cliente}
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <InfoItem label="Cliente" value={op.cliente} />
              <InfoItem label="Partner" value={op.partner} />
              <InfoItem label="Tipo de contrato" value={op.tipoContrato} />
              <InfoItem label="Última actividad" value={formatFechaLarga(op.ultimaActividad)} />
              <InfoItem label="Valor del contrato" value={
                <span className="font-clash" style={{ fontSize: 20, fontWeight: 700, color: '#F5F7F7', letterSpacing: '-0.01em' }}>
                  {formatValor(op.valor)}
                </span>
              } />
              {op.estado === 'sin_respuesta' && op.diasSinRespuesta > 0 && (
                <InfoItem label="Sin respuesta" value={
                  <span style={{ color: '#F97316', fontWeight: 600 }}>{op.diasSinRespuesta} días</span>
                } />
              )}
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
              <ActionButton
                icon={Send}
                label="Enviar Pulse Check"
                onClick={() => enviarPulseCheck(op.id)}
                color="#F5B942"
              />
              {!['cerrada', 'ganada', 'perdida'].includes(op.estado) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    onClick={() => setConfirmAction('ganada')}
                    style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 14px', background: '#B0FF92', border: 'none', borderRadius: 9, color: '#121716', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', width: '100%', textAlign: 'left', transition: 'opacity 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.88' }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                  >
                    <CheckCircle size={15} strokeWidth={2} />
                    Cerrar como ganada
                  </button>
                  <button
                    onClick={() => setConfirmAction('perdida')}
                    style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, color: '#A3AEAC', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', width: '100%', textAlign: 'left', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#F5F7F7'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#A3AEAC'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                  >
                    <XCircle size={15} strokeWidth={1.5} />
                    Descalificar
                  </button>
                </div>
              )}
            </div>
          </Section>

          {/* Pulse check history */}
          <Section title="Historial de Pulse Checks">
            {op.pulseChecks.length === 0 ? (
              <p style={{ fontSize: 13, color: '#6F7876', fontFamily: 'DM Sans, sans-serif' }}>
                Sin Pulse Checks enviados.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {op.pulseChecks.map((pc, i) => {
                  const s = PULSE_ESTADO_CONFIG[pc.estado] || PULSE_ESTADO_CONFIG['Enviado']
                  return (
                    <div
                      key={i}
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
                      <div>
                        <p style={{ fontSize: 12, color: '#F5F7F7', margin: 0, fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
                          {formatFechaLarga(pc.fecha)}
                        </p>
                        <p style={{ fontSize: 11, color: '#6F7876', margin: '2px 0 0', fontFamily: 'DM Sans, sans-serif' }}>
                          {pc.destinatario}
                        </p>
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        color: s.color,
                        background: s.bg,
                        border: `1px solid ${s.border}`,
                        padding: '2px 8px',
                        borderRadius: 4,
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}>
                        {pc.estado}
                      </span>
                    </div>
                  )
                })}

                {/* Abrir conversación button */}
                <button
                  onClick={() => setPulseCheckPanelOpen(true)}
                  style={{
                    marginTop: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    color: '#A3AEAC',
                    fontSize: 13,
                    cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#F5F7F7'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = '#A3AEAC'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                  }}
                >
                  <MessageCircle size={15} strokeWidth={1.5} />
                  Abrir conversación
                </button>
              </div>
            )}
          </Section>

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
                  navigate('/')
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

      {/* Pulse Check Panel */}
      <PulseCheckPanel
        op={op}
        isOpen={pulseCheckPanelOpen}
        onClose={() => {
          setPulseCheckPanelOpen(false)
          setPulseCheckPanelExpanded(false)
        }}
        isExpanded={pulseCheckPanelExpanded}
        onToggleExpand={() => setPulseCheckPanelExpanded(!pulseCheckPanelExpanded)}
      />
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
        <button onClick={onToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
          {op.automatico
            ? <ToggleRight size={32} color="#B0FF92" strokeWidth={1.5} />
            : <ToggleLeft size={32} color="#6F7876" strokeWidth={1.5} />}
        </button>
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
