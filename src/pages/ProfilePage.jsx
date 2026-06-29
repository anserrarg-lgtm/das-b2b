import { useState, useRef } from 'react'
import { ChevronDown, Mail, MessageCircle, Database, RotateCcw } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Toggle from '../components/Toggle'


const ROL_OPTIONS = [
  { value: 'cam', label: 'Channel Account Manager' },
  { value: 'pam', label: 'Partner Account Manager' },
  { value: 'alliances', label: 'Alliances Manager' },
  { value: 'pdm', label: 'Partner Development Manager' },
  { value: 'csm', label: 'Channel Sales Manager' },
]

const PERIODO_OPTIONS = [
  { value: 'mensual',       label: 'Mensual (más común)' },
  { value: 'trimestral',    label: 'Trimestral'          },
  { value: 'semestral',     label: 'Semestral'           },
  { value: 'anual',         label: 'Anual'               },
  { value: 'personalizado', label: 'Personalizado'       },
]

const DEFAULT_MESSAGES = {
  activa: 'Hola [nombre], ¿cómo va el proceso con [cliente]? ¿Hay algo en lo que podamos apoyarte para avanzar?',
  esperando: 'Hola [nombre], te escribimos para hacer seguimiento sobre [cliente]. ¿Pudiste avanzar con ellos? Cualquier actualización nos ayuda mucho.',
  sin_respuesta: 'Hola [nombre], llevamos un tiempo sin noticias sobre [cliente]. ¿Sigue activa esta oportunidad? Nos interesa saber si hay algo que esté bloqueando el proceso.',
  respondida: 'Hola [nombre], ¿cómo va el proceso con [cliente]? ¿Hay algo en lo que podamos apoyarte para avanzar?',
  venta_confirmada: 'Hola [nombre], gracias por confirmar. Para registrar correctamente la venta necesitamos algunos detalles: ¿qué producto se vendió, cuántas licencias y cuál fue la fecha de cierre?',
  reactivacion: 'Hola [nombre], queríamos retomar el contacto sobre [cliente]. ¿Sigue siendo una oportunidad activa o prefieres cerrarla por ahora?',
}

const MESSAGE_LABELS = {
  activa: 'Activa',
  esperando: 'Esperando respuesta',
  sin_respuesta: 'Sin respuesta',
  respondida: 'Respondida',
  venta_confirmada: 'Venta confirmada',
  reactivacion: 'Reactivación',
}

const FIELD_LABEL = {
  fontSize: 11, color: '#6F7876', margin: '0 0 8px',
  fontFamily: 'DM Sans, sans-serif',
  textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500,
}

const INPUT_STYLE = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 8,
  color: '#F5F7F7',
  fontSize: 14,
  padding: '10px 14px',
  outline: 'none',
  fontFamily: 'DM Sans, sans-serif',
  boxSizing: 'border-box',
}

const SECTION_TITLE = {
  fontFamily: "'Satoshi', sans-serif",
  fontWeight: 700,
  fontSize: 18,
  color: '#F5F7F7',
  margin: '0 0 6px',
}

const SECTION_DESC = {
  fontFamily: 'DM Sans, sans-serif',
  fontSize: 13,
  color: '#6F7876',
  margin: '0 0 24px',
}

const DIVIDER = {
  height: 1,
  background: 'rgba(255,255,255,0.06)',
  margin: '36px 0',
}

function CustomDropdown({ value, onChange, options }) {
  const [open, setOpen] = useState(false)
  const selected = options.find(o => o.value === value)
  return (
    <div style={{ position: 'relative' }}>
      <div
        onClick={(e) => {
          e.stopPropagation()
          setOpen(o => !o)
        }}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 8, padding: '10px 14px', color: '#F5F7F7',
          fontFamily: 'DM Sans, sans-serif', fontSize: 14,
          cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', userSelect: 'none',
        }}
      >
        <span>{selected ? selected.label : '—'}</span>
        <ChevronDown size={14} color="#6F7876" strokeWidth={1.5} style={{ transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }} />
      </div>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#1A1F1E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, zIndex: 9999, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
            {options.map(opt => (
              <div
                key={opt.value}
                onClick={(e) => {
                  e.stopPropagation()
                  onChange(opt.value)
                  setOpen(false)
                }}
                style={{ padding: '10px 14px', color: opt.value === value ? '#B0FF92' : '#A3AEAC', fontFamily: 'DM Sans, sans-serif', fontSize: 14, cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#F5F7F7' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = opt.value === value ? '#B0FF92' : '#A3AEAC' }}
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

function MessageField({ label, value, defaultValue, onChange }) {
  const MAX_CHARS = 300
  const isModified = value !== defaultValue
  const nearLimit = value.length > MAX_CHARS * 0.9

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#A3AEAC', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </span>
        {isModified && (
          <button
            onClick={() => onChange(defaultValue)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: '#6F7876', fontSize: 11, fontFamily: 'DM Sans, sans-serif', padding: '2px 6px', borderRadius: 4, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#A3AEAC'}
            onMouseLeave={e => e.currentTarget.style.color = '#6F7876'}
          >
            <RotateCcw size={11} strokeWidth={1.5} />
            Restablecer
          </button>
        )}
      </div>
      <textarea
        value={value}
        onChange={e => e.target.value.length <= MAX_CHARS && onChange(e.target.value)}
        rows={3}
        style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#F5F7F7', fontFamily: 'DM Sans, sans-serif', fontSize: 13, lineHeight: 1.65, resize: 'vertical', boxSizing: 'border-box', minHeight: 68 }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 8 }}>
        <span style={{ fontSize: 11, color: '#4A5452', fontFamily: 'DM Sans, sans-serif' }}>
          Variables: <span style={{ color: '#7B58F8' }}>[nombre]</span> · <span style={{ color: '#7B58F8' }}>[cliente]</span>
        </span>
        <span style={{ fontSize: 11, color: nearLimit ? '#F97316' : '#4A5452', fontFamily: 'DM Sans, sans-serif' }}>
          {value.length} / {MAX_CHARS}
        </span>
      </div>
    </div>
  )
}

function IntegrationCard({ icon: Icon, title, description, status, buttonLabel }) {
  const isComingSoon = status === 'coming_soon'
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, opacity: isComingSoon ? 0.55 : 1 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: isComingSoon ? 'rgba(255,255,255,0.04)' : 'rgba(176,255,146,0.1)', border: `1px solid ${isComingSoon ? 'rgba(255,255,255,0.06)' : 'rgba(176,255,146,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} color={isComingSoon ? '#4A5452' : '#B0FF92'} strokeWidth={1.5} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: '#F5F7F7', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>{title}</p>
          {isComingSoon && (
            <span style={{ fontSize: 10, fontWeight: 600, color: '#6F7876', background: 'rgba(255,255,255,0.06)', borderRadius: 4, padding: '2px 6px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Próximamente
            </span>
          )}
        </div>
        <p style={{ fontSize: 12, color: '#6F7876', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>{description}</p>
      </div>
      <button
        disabled={isComingSoon}
        style={{ padding: '8px 16px', borderRadius: 8, background: isComingSoon ? 'rgba(255,255,255,0.04)' : '#B0FF92', border: 'none', cursor: isComingSoon ? 'not-allowed' : 'pointer', color: isComingSoon ? '#4A5452' : '#121716', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', flexShrink: 0, transition: 'opacity 0.15s', whiteSpace: 'nowrap' }}
      >
        {buttonLabel}
      </button>
    </div>
  )
}

export default function ProfilePage() {
  const { compensacion, guardarCompensacion } = useApp()
  const fileInputRef = useRef(null)

  // Section 1
  const [nombre, setNombre] = useState('Carlos')
  const [rol, setRol] = useState('cam')
  const [empresa, setEmpresa] = useState('')
  const [foto, setFoto] = useState(null)

  // Section 2
  const [moneda, setMoneda] = useState('USD')
  const [salarioBase, setSalarioBase] = useState(compensacion?.salarioBase?.toString() || '')
  const [basePercent, setBasePercent] = useState(60)
  const [varPercent, setVarPercent] = useState(40)
  const [bonusItems, setBonusItems] = useState([
    { nombre: 'Revenue atribuido', porcentaje: 40 },
    { nombre: 'Referidos aceptados', porcentaje: 40 },
    { nombre: 'Asistencia', porcentaje: 20 },
  ])
  const [diasHabiles, setDiasHabiles] = useState(0)
  const [diasInasistencia, setDiasInasistencia] = useState(0)
  const [periodo, setPeriodo]               = useState(compensacion?.periodo || 'mensual')
  const [periodoInicio, setPeriodoInicio]   = useState(compensacion?.periodoInicio || '')
  const [periodoFin, setPeriodoFin]         = useState(compensacion?.periodoFin || '')
  const [periodoAtribucion, setPeriodoAtribucion] = useState(localStorage.getItem('periodoAtribucion') || '60')
  const [periodoAtribucionCustom, setPeriodoAtribucionCustom] = useState('')

  // Save periodoAtribucion to localStorage
  const handlePeriodoAtribucionChange = (value) => {
    setPeriodoAtribucion(value)
    if (value !== 'personalizado') {
      localStorage.setItem('periodoAtribucion', value)
    }
  }

  // Calculate bonus total and attendance percentage
  const bonusTotal = bonusItems.reduce((sum, item) => sum + item.porcentaje, 0)
  const diasAsistencia = diasHabiles > 0 ? Math.round(((diasHabiles - diasInasistencia) / diasHabiles) * 100) : 0
  // Section 3
  const [canal, setCanal] = useState('email')
  const [frecuencia, setFrecuencia] = useState('14')
  const [frecuenciaPerStatus, setFrecuenciaPerStatus] = useState({
    sin_respuesta: '5',
    venta_confirmada: '3',
  })
  const [mensajes, setMensajes] = useState(DEFAULT_MESSAGES)
  const [ventanaRespuesta, setVentanaRespuesta] = useState(
    () => {
      const stored = localStorage.getItem('ventana_respuesta_partner')
      return stored ? stored : '7'
    }
  )

  // Section 4
  const [notifSinRespuesta, setNotifSinRespuesta] = useState(true)
  const [notifVentaConfirmada, setNotifVentaConfirmada] = useState(true)
  const [notifPulseCheck, setNotifPulseCheck] = useState(true)
  const [notifPartnerRespondio, setNotifPartnerRespondio] = useState(true)
  const [notifFrecuencia, setNotifFrecuencia] = useState('inmediato')

  // Pulse Check AI settings
  const [reviewBeforeSend, setReviewBeforeSend] = useState(false)

  const [saved, setSaved] = useState(false)

  const salarioBaseNum = parseFloat(salarioBase) || 0

  function handleFotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setFoto(reader.result)
    reader.readAsDataURL(file)
  }

  function handleSave() {
    if (salarioBaseNum > 0) {
      guardarCompensacion({
        salarioBase: salarioBaseNum,
        moneda,
        basePercent,
        variablePercent: varPercent,
        bonusItems,
        periodo,
        periodoInicio: periodo === 'personalizado' ? periodoInicio : null,
        periodoFin:    periodo === 'personalizado' ? periodoFin    : null,
      })
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={{ padding: '40px 40px 120px', maxWidth: 680, margin: '0 auto' }}>

      {/* Page header */}
      <h1 style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 300, fontSize: 48, color: '#F5F7F7', margin: '0 0 6px', letterSpacing: '-0.03em', lineHeight: 1 }}>
        Perfil
      </h1>
      <p style={{ fontSize: 14, color: '#6F7876', margin: '0 0 40px', fontFamily: 'DM Sans, sans-serif' }}>
        Gestiona tu información, compensación, preferencias y notificaciones.
      </p>

      {/* ── SECTION 1: Información personal ── */}
      <section>
        <h2 style={SECTION_TITLE}>Información personal</h2>
        <p style={SECTION_DESC}>Tu perfil visible en Beacon.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            {/* Photo */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{ width: 72, height: 72, borderRadius: '50%', background: foto ? 'transparent' : 'linear-gradient(135deg, rgba(176,255,146,0.2) 0%, rgba(88,99,248,0.2) 100%)', border: '1px solid rgba(176,255,146,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(176,255,146,0.5)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(176,255,146,0.2)'}
              >
                {foto
                  ? <img src={foto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Foto de perfil" />
                  : <span style={{ fontSize: 22, fontWeight: 600, color: '#B0FF92', fontFamily: 'DM Sans, sans-serif' }}>{nombre ? nombre[0].toUpperCase() : 'C'}</span>
                }
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFotoChange} />
              <span onClick={() => fileInputRef.current?.click()} style={{ fontSize: 11, color: '#6F7876', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>
                Cambiar foto
              </span>
            </div>

            {/* Nombre + Empresa */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <p style={FIELD_LABEL}>Nombre</p>
                <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" style={INPUT_STYLE} />
              </div>
              <div>
                <p style={FIELD_LABEL}>Empresa</p>
                <input type="text" value={empresa} onChange={e => setEmpresa(e.target.value)} placeholder="Nombre de tu empresa" style={INPUT_STYLE} />
              </div>
            </div>
          </div>

          <div>
            <p style={FIELD_LABEL}>Rol</p>
            <CustomDropdown value={rol} onChange={setRol} options={ROL_OPTIONS} />
          </div>
        </div>
      </section>

      <div style={DIVIDER} />

      {/* ── SECTION 2: Compensación ── */}
      <section>
        <h2 style={SECTION_TITLE}>Configuración de compensación</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* 1. MONEDA */}
          <div>
            <p style={FIELD_LABEL}>MONEDA</p>
            <CustomDropdown
              value={moneda} onChange={setMoneda}
              options={[
                { value: 'USD', label: 'USD — Dólar estadounidense' },
                { value: 'COP', label: 'COP — Peso colombiano' },
                { value: 'EUR', label: 'EUR — Euro' },
                { value: 'MXN', label: 'MXN — Peso mexicano' },
                { value: 'BRL', label: 'BRL — Real brasileño' },
              ]}
            />
          </div>

          {/* 2. SALARIO Y SPLIT */}
          <div>
            <p style={FIELD_LABEL}>SALARIO BASE MENSUAL</p>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: 16, fontSize: 14, color: '#A3AEAC', fontFamily: 'DM Sans, sans-serif' }}>
                {moneda === 'USD' ? '$' : moneda === 'EUR' ? '€' : moneda}
              </span>
              <input
                type="number"
                value={salarioBase}
                onChange={e => setSalarioBase(e.target.value)}
                placeholder="ej. 5,000"
                style={{ ...INPUT_STYLE, paddingLeft: 32 }}
              />
            </div>
          </div>

          {/* SPLIT SALARIAL */}
          <div>
            <p style={FIELD_LABEL}>SPLIT SALARIAL</p>
            <p style={{ fontSize: 12, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', margin: '0 0 12px', lineHeight: 1.5 }}>
              Proporción entre salario fijo y variable
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <p style={{ ...FIELD_LABEL, margin: '0 0 6px' }}>% Base</p>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={basePercent}
                  onChange={e => {
                    const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                    setBasePercent(val)
                    setVarPercent(100 - val)
                  }}
                  style={INPUT_STYLE}
                />
              </div>
              <div>
                <p style={{ ...FIELD_LABEL, margin: '0 0 6px' }}>% Variable</p>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={varPercent}
                  onChange={e => {
                    const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                    setVarPercent(val)
                    setBasePercent(100 - val)
                  }}
                  style={INPUT_STYLE}
                />
              </div>
            </div>
            {salarioBase && (
              <p style={{ fontSize: 12, color: '#A3AEAC', fontFamily: 'DM Sans, sans-serif', margin: 0 }}>
                Base: ${((salarioBase * basePercent) / 100).toLocaleString()} · Variable: ${((salarioBase * varPercent) / 100).toLocaleString()}
              </p>
            )}
          </div>

          {/* 2.5 PERÍODO DE ATRIBUCIÓN */}
          <div>
            <p style={FIELD_LABEL}>PERÍODO DE ATRIBUCIÓN</p>
            <p style={{ fontSize: 12, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', margin: '0 0 10px', lineHeight: 1.5 }}>
              Tiempo máximo para registrar una venta después de que se confirme
            </p>
            <CustomDropdown
              value={periodoAtribucion}
              onChange={handlePeriodoAtribucionChange}
              options={[
                { value: '30', label: '30 días' },
                { value: '45', label: '45 días' },
                { value: '60', label: '60 días (recomendado)' },
                { value: '90', label: '90 días' },
                { value: 'personalizado', label: 'Personalizado' },
              ]}
            />
            {periodoAtribucion === 'personalizado' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={periodoAtribucionCustom}
                  onChange={e => setPeriodoAtribucionCustom(e.target.value)}
                  placeholder="ej. 75"
                  style={{ ...INPUT_STYLE, flex: 1 }}
                />
                <span style={{ fontSize: 14, color: '#A3AEAC', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>días</span>
              </div>
            )}
          </div>

          {/* 3. PERÍODO DE RENDIMIENTO */}
          <div>
            <p style={FIELD_LABEL}>PERÍODO DE RENDIMIENTO</p>
            <p style={{ fontSize: 12, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', margin: '0 0 10px', lineHeight: 1.5 }}>
              Define cada cuánto se miden tus resultados y se calcula tu bono
            </p>
            <CustomDropdown value={periodo} onChange={setPeriodo} options={PERIODO_OPTIONS} />
            {periodo === 'personalizado' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                <div>
                  <p style={{ ...FIELD_LABEL, margin: '0 0 6px' }}>Inicio del período</p>
                  <input
                    type="date"
                    value={periodoInicio}
                    onChange={e => setPeriodoInicio(e.target.value)}
                    style={{ ...INPUT_STYLE, colorScheme: 'dark' }}
                  />
                </div>
                <div>
                  <p style={{ ...FIELD_LABEL, margin: '0 0 6px' }}>Fin del período</p>
                  <input
                    type="date"
                    value={periodoFin}
                    onChange={e => setPeriodoFin(e.target.value)}
                    min={periodoInicio || undefined}
                    style={{ ...INPUT_STYLE, colorScheme: 'dark' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 4. SPLIT DE BONIFICACIÓN */}
          <div>
            <p style={FIELD_LABEL}>SPLIT DE BONIFICACIÓN</p>
            <p style={{ fontSize: 12, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', margin: '0 0 12px', lineHeight: 1.5 }}>
              Define cómo se distribuye tu bono variable entre las métricas que te evalúan
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {bonusItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                  <input
                    type="text"
                    value={item.nombre}
                    onChange={e => {
                      const newItems = [...bonusItems]
                      newItems[idx].nombre = e.target.value
                      setBonusItems(newItems)
                    }}
                    placeholder="Nombre de la métrica"
                    style={{ ...INPUT_STYLE, flex: 1 }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={item.porcentaje}
                      onChange={e => {
                        const newItems = [...bonusItems]
                        newItems[idx].porcentaje = parseInt(e.target.value) || 0
                        setBonusItems(newItems)
                      }}
                      style={{ ...INPUT_STYLE, width: 80 }}
                    />
                    <span style={{ fontSize: 14, color: '#A3AEAC' }}>%</span>
                  </div>
                  <button
                    onClick={() => {
                      if (bonusItems.length > 1) {
                        setBonusItems(bonusItems.filter((_, i) => i !== idx))
                      }
                    }}
                    disabled={bonusItems.length === 1}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: bonusItems.length === 1 ? '#4A5452' : '#A3AEAC',
                      cursor: bonusItems.length === 1 ? 'not-allowed' : 'pointer',
                      fontSize: 18,
                      padding: '8px 12px',
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 12, color: bonusTotal === 100 ? '#B0FF92' : '#F97316', fontFamily: 'DM Sans, sans-serif', margin: 0 }}>
                Total: {bonusTotal}% {bonusTotal === 100 ? '✓' : '— debe sumar 100%'}
              </p>
              <button
                onClick={() => setBonusItems([...bonusItems, { nombre: 'Nueva métrica', porcentaje: 0 }])}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#B0FF92',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: 13,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                + Agregar métrica
              </button>
            </div>
          </div>

          {/* 5. ASISTENCIA CARD - Conditional */}
          {bonusItems.some(item => item.nombre.toLowerCase() === 'asistencia' || item.porcentaje > 0) && (
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 10,
              padding: 20,
            }}>
              <h3 style={{
                fontSize: 15,
                fontWeight: 700,
                fontFamily: "'Satoshi', sans-serif",
                color: '#F5F7F7',
                margin: '0 0 16px',
              }}>
                Registrar asistencia este período
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <p style={{ ...FIELD_LABEL, margin: '0 0 6px' }}>Días hábiles del período</p>
                  <input
                    type="number"
                    value={diasHabiles}
                    onChange={e => setDiasHabiles(parseInt(e.target.value) || 0)}
                    placeholder="ej. 22"
                    style={INPUT_STYLE}
                  />
                </div>
                <div>
                  <p style={{ ...FIELD_LABEL, margin: '0 0 6px' }}>Días de inasistencia</p>
                  <input
                    type="number"
                    value={diasInasistencia}
                    onChange={e => setDiasInasistencia(parseInt(e.target.value) || 0)}
                    placeholder="ej. 2"
                    style={INPUT_STYLE}
                  />
                </div>
              </div>
              {diasHabiles > 0 && (
                <p style={{
                  fontSize: 13,
                  fontFamily: 'DM Sans, sans-serif',
                  color: diasAsistencia >= 95 ? '#B0FF92' : diasAsistencia >= 80 ? '#F5B942' : '#F97316',
                  margin: '0 0 16px',
                }}>
                  Asistencia: {diasAsistencia}% ({diasHabiles - diasInasistencia} días presentes de {diasHabiles} hábiles)
                </p>
              )}
              <button
                style={{
                  background: '#B0FF92',
                  color: '#121716',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 20px',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Guardar asistencia
              </button>
            </div>
          )}
        </div>
      </section>

      <div style={DIVIDER} />

      {/* ── SECTION 3A: Pulse Check preferences ── */}
      <section>
        <h2 style={SECTION_TITLE}>Preferencias de Pulse Check</h2>
        <p style={SECTION_DESC}>Personaliza cómo se envían los Pulse Checks a tus partners.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Canal preferido */}
          <div>
            <p style={FIELD_LABEL}>Canal preferido</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setCanal('email')}
                style={{ padding: '8px 16px', borderRadius: 8, cursor: 'pointer', background: canal === 'email' ? 'rgba(176,255,146,0.08)' : 'rgba(255,255,255,0.04)', border: canal === 'email' ? '1px solid rgba(176,255,146,0.2)' : '1px solid rgba(255,255,255,0.06)', color: canal === 'email' ? '#B0FF92' : '#A3AEAC', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500, transition: 'all 0.15s' }}
              >
                Email
              </button>
              <button
                disabled
                style={{ padding: '8px 16px', borderRadius: 8, cursor: 'not-allowed', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', color: '#4A5452', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}
              >
                WhatsApp
                <span style={{ fontSize: 10, fontWeight: 600, color: '#6F7876', background: 'rgba(255,255,255,0.06)', borderRadius: 4, padding: '2px 6px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Próximamente
                </span>
              </button>
            </div>
          </div>

          {/* Review before send toggle */}
          <div>
            <p style={FIELD_LABEL}>Revisión de mensajes</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, fontWeight: 500, color: '#6F7876', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'DM Sans, sans-serif', margin: '0 0 4px' }}>Revisar mensajes antes de enviar automáticamente</p>
                <p style={{ fontSize: 13, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', margin: 0 }}>Los mensajes generados con IA esperarán tu aprobación antes de enviarse</p>
              </div>
              <Toggle value={reviewBeforeSend} onChange={setReviewBeforeSend} />
            </div>
          </div>
        </div>
      </section>

      <div style={DIVIDER} />

      {/* ── SECTION 3B: Response window ── */}
      <section>
        <h2 style={SECTION_TITLE}>Ventana de respuesta del partner</h2>
        <p style={SECTION_DESC}>Tiempo máximo de espera antes de mover una oportunidad a Sin respuesta</p>

        <div>
          <p style={FIELD_LABEL}>Días de espera</p>
          <CustomDropdown
            value={ventanaRespuesta}
            onChange={v => {
              setVentanaRespuesta(v)
              if (v !== 'personalizado') {
                localStorage.setItem('ventana_respuesta_partner', v)
              }
            }}
            options={[
              { value: '3', label: '3 días' },
              { value: '5', label: '5 días' },
              { value: '7', label: '7 días' },
              { value: '14', label: '14 días' },
              { value: '30', label: '30 días' },
              { value: 'personalizado', label: 'Personalizado' },
            ]}
          />

          {ventanaRespuesta === 'personalizado' && (
            <div style={{ marginTop: 12 }}>
              <input
                type="number"
                placeholder="Escribe los días"
                min="1"
                max="90"
                style={{ ...INPUT_STYLE }}
                onChange={(e) => {
                  if (e.target.value) {
                    localStorage.setItem('ventana_respuesta_partner', e.target.value)
                  }
                }}
              />
            </div>
          )}

          <p style={{ fontSize: 11, color: '#6F7876', margin: '12px 0 0', fontFamily: 'DM Sans, sans-serif' }}>
            Puedes ajustar este tiempo individualmente desde cada oportunidad
          </p>
        </div>
      </section>

      <div style={DIVIDER} />

      {/* ── SECTION 4: Notificaciones ── */}
      <section>
        <h2 style={SECTION_TITLE}>Notificaciones</h2>
        <p style={SECTION_DESC}>Elige qué eventos quieres recibir y con qué frecuencia.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            { label: 'Sin respuesta', desc: 'Cuando un deal lleva 10+ días sin actividad', value: notifSinRespuesta, set: setNotifSinRespuesta },
            { label: 'Venta confirmada', desc: 'Cuando el partner confirma una venta', value: notifVentaConfirmada, set: setNotifVentaConfirmada },
            { label: 'Pulse Check enviado', desc: 'Confirmación cuando se envía un Pulse Check automático', value: notifPulseCheck, set: setNotifPulseCheck },
            { label: 'Partner respondió', desc: 'Cuando se registra nueva actividad en un deal', value: notifPartnerRespondio, set: setNotifPartnerRespondio },
          ].map(({ label, desc, value, set }, i) => (
            <div
              key={label}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
            >
              <div>
                <p style={{ fontSize: 14, color: '#F5F7F7', margin: '0 0 2px', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>{label}</p>
                <p style={{ fontSize: 12, color: '#6F7876', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>{desc}</p>
              </div>
              <Toggle value={value} onChange={set} />
            </div>
          ))}

          <div style={{ marginTop: 20 }}>
            <p style={FIELD_LABEL}>Frecuencia de entrega</p>
            <CustomDropdown
              value={notifFrecuencia} onChange={setNotifFrecuencia}
              options={[
                { value: 'inmediato', label: 'Inmediato' },
                { value: 'diario', label: 'Resumen diario' },
                { value: 'semanal', label: 'Resumen semanal' },
              ]}
            />
          </div>
        </div>
      </section>

      <div style={DIVIDER} />

      {/* ── SECTION 5: Integraciones ── */}
      <section>
        <h2 style={SECTION_TITLE}>Integraciones</h2>
        <p style={SECTION_DESC}>Conecta Beacon con tus herramientas de trabajo.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <IntegrationCard
            icon={Mail}
            title="Email (Resend)"
            description="Envía Pulse Checks directamente desde tu correo"
            status="active"
            buttonLabel="Conectar email"
          />
          <IntegrationCard
            icon={MessageCircle}
            title="WhatsApp Business"
            description="Envía Pulse Checks por WhatsApp"
            status="coming_soon"
            buttonLabel="Conectar WhatsApp"
          />
          <IntegrationCard
            icon={Database}
            title="CRM"
            description="Sincroniza con Salesforce o Dynamics"
            status="coming_soon"
            buttonLabel="Conectar CRM"
          />
        </div>
      </section>

      {/* ── Floating save bar ── */}
      <div style={{ position: 'fixed', bottom: 0, right: 0, left: 240, padding: '14px 40px', background: 'rgba(18,23,22,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'flex-end', zIndex: 30 }}>
        <button
          onClick={handleSave}
          style={{ padding: '10px 28px', background: saved ? 'rgba(176,255,146,0.12)' : '#B0FF92', border: saved ? '1px solid rgba(176,255,146,0.25)' : 'none', borderRadius: 9, color: saved ? '#B0FF92' : '#121716', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
        >
          {saved ? '✓ Cambios guardados' : 'Guardar cambios'}
        </button>
      </div>

    </div>
  )
}
