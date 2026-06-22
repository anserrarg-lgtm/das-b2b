import { useState, useRef } from 'react'
import { ChevronDown, Mail, MessageCircle, Database, RotateCcw } from 'lucide-react'
import { useApp } from '../context/AppContext'


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
  venta_confirmada: 'Hola [nombre], nos llegó información de que [cliente] realizó una compra. ¿Puedes confirmarnos el producto, cantidad y fecha para registrar correctamente la atribución?',
  reactivacion: 'Hola [nombre], queríamos retomar el contacto sobre [cliente]. ¿Sigue siendo una oportunidad activa o prefieres cerrarla por ahora?',
}

const MESSAGE_LABELS = {
  activa: 'Activa',
  esperando: 'Esperando respuesta',
  sin_respuesta: 'Sin respuesta',
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
  fontFamily: "'Cabinet Grotesk', sans-serif",
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
        onClick={() => setOpen(o => !o)}
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
                onClick={() => { onChange(opt.value); setOpen(false) }}
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

function Toggle({ enabled, onChange }) {
  return (
    <div
      onClick={() => onChange(!enabled)}
      style={{
        width: 40, height: 22, borderRadius: 11,
        background: enabled ? '#B0FF92' : 'rgba(255,255,255,0.1)',
        cursor: 'pointer', position: 'relative',
        transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: '50%',
        background: enabled ? '#121716' : '#6F7876',
        position: 'absolute', top: 3,
        left: enabled ? 21 : 3,
        transition: 'left 0.2s, background 0.2s',
      }} />
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
  const [cuota, setCuota] = useState(compensacion?.cuota?.toString() || '')
  const [split, setSplit] = useState(compensacion?.split || '6040')
  const [basePercent, setBasePercent] = useState(
    compensacion?.split === 'personalizado' ? String(100 - (compensacion.variablePercent || 40)) : '60'
  )
  const [varPercent, setVarPercent] = useState(
    compensacion?.split === 'personalizado' ? String(compensacion.variablePercent || 40) : '40'
  )
  const [periodo, setPeriodo]               = useState(compensacion?.periodo || 'mensual')
  const [periodoInicio, setPeriodoInicio]   = useState(compensacion?.periodoInicio || '')
  const [periodoFin, setPeriodoFin]         = useState(compensacion?.periodoFin || '')
  // Section 3
  const [canal, setCanal] = useState('email')
  const [frecuencia, setFrecuencia] = useState('14')
  const [mensajes, setMensajes] = useState(DEFAULT_MESSAGES)

  // Section 4
  const [notifSinRespuesta, setNotifSinRespuesta] = useState(true)
  const [notifVentaConfirmada, setNotifVentaConfirmada] = useState(true)
  const [notifPulseCheck, setNotifPulseCheck] = useState(true)
  const [notifPartnerRespondio, setNotifPartnerRespondio] = useState(true)
  const [notifFrecuencia, setNotifFrecuencia] = useState('inmediato')

  const [saved, setSaved] = useState(false)

  const derivedVariable =
    split === 'personalizado' ? parseFloat(varPercent) || 0
    : split === '6040' ? 40
    : split === '7030' ? 30
    : 50

  const cuotaNum = parseFloat(cuota.replace(/,/g, '')) || 0

  function handleFotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setFoto(reader.result)
    reader.readAsDataURL(file)
  }

  function handleSave() {
    if (cuotaNum > 0) {
      guardarCompensacion({
        cuota: cuotaNum,
        split,
        variablePercent: derivedVariable,
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
      <h1 className="font-clash" style={{ fontSize: 28, fontWeight: 700, color: '#F5F7F7', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
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
        <p style={SECTION_DESC}>Define tu cuota, split y período de rendimiento para calcular el bono estimado.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <p style={FIELD_LABEL}>Cuota mensual (USD)</p>
            <input type="text" value={cuota} onChange={e => setCuota(e.target.value)} placeholder="ej. 500,000" style={INPUT_STYLE} />
          </div>

          <div>
            <p style={FIELD_LABEL}>Split salarial</p>
            <CustomDropdown
              value={split} onChange={setSplit}
              options={[
                { value: '6040', label: '60/40 (más común)' },
                { value: '7030', label: '70/30' },
                { value: '5050', label: '50/50' },
                { value: 'personalizado', label: 'Personalizado' },
              ]}
            />
            {split === 'personalizado' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                <div>
                  <p style={{ ...FIELD_LABEL, margin: '0 0 6px' }}>% Base</p>
                  <input type="number" min="0" max="100" value={basePercent} onChange={e => setBasePercent(e.target.value)} placeholder="60" style={INPUT_STYLE} />
                </div>
                <div>
                  <p style={{ ...FIELD_LABEL, margin: '0 0 6px' }}>% Variable</p>
                  <input type="number" min="0" max="100" value={varPercent} onChange={e => setVarPercent(e.target.value)} placeholder="40" style={INPUT_STYLE} />
                </div>
              </div>
            )}
          </div>

          <div>
            <p style={FIELD_LABEL}>Período de rendimiento</p>
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

        </div>
      </section>

      <div style={DIVIDER} />

      {/* ── SECTION 3: Pulse Check preferences ── */}
      <section>
        <h2 style={SECTION_TITLE}>Preferencias de Pulse Check</h2>
        <p style={SECTION_DESC}>Personaliza cómo y cuándo se envían los Pulse Checks a tus partners.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Canal */}
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

          {/* Frecuencia */}
          <div>
            <p style={FIELD_LABEL}>Frecuencia automática por defecto</p>
            <CustomDropdown
              value={frecuencia} onChange={setFrecuencia}
              options={[
                { value: '7', label: '7 días' },
                { value: '14', label: '14 días' },
                { value: '30', label: '30 días' },
                { value: 'personalizado', label: 'Personalizado' },
              ]}
            />
          </div>

          {/* Message templates */}
          <div>
            <p style={FIELD_LABEL}>Mensajes predeterminados por estado</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Object.entries(mensajes).map(([key, text]) => (
                <MessageField
                  key={key}
                  label={MESSAGE_LABELS[key]}
                  value={text}
                  defaultValue={DEFAULT_MESSAGES[key]}
                  onChange={v => setMensajes(prev => ({ ...prev, [key]: v }))}
                />
              ))}
            </div>
          </div>
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
              <Toggle enabled={value} onChange={set} />
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
