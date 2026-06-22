import { useState } from 'react'
import { ArrowLeft, ChevronDown, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

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
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
            background: '#1A1F1E', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, zIndex: 9999, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', overflow: 'hidden',
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

export default function ProfileSettings() {
  const { compensacion, guardarCompensacion } = useApp()
  const navigate = useNavigate()

  const [cuota, setCuota] = useState(compensacion?.cuota?.toString() || '')
  const [split, setSplit] = useState(compensacion?.split || '6040')
  const [basePercent, setBasePercent] = useState(
    compensacion?.split === 'personalizado' ? String(100 - (compensacion.variablePercent || 40)) : '60'
  )
  const [variablePercent, setVariablePercent] = useState(
    compensacion?.split === 'personalizado' ? String(compensacion.variablePercent || 40) : '40'
  )
  const [ciclo, setCiclo] = useState(compensacion?.ciclo || 'estandar')
  const [cicloCustomMonth, setCicloCustomMonth] = useState(
    compensacion?.cicloCustomStartMonth != null ? String(compensacion.cicloCustomStartMonth) : '0'
  )
  const [saved, setSaved] = useState(false)

  const derivedVariable =
    split === 'personalizado' ? parseFloat(variablePercent) || 0
    : split === '6040' ? 40
    : split === '7030' ? 30
    : 50

  const cuotaNum = parseFloat(cuota.replace(/,/g, '')) || 0
  const canSave = cuotaNum > 0

  function handleSave() {
    if (!canSave) return
    guardarCompensacion({
      cuota: cuotaNum,
      split,
      variablePercent: derivedVariable,
      ciclo,
      cicloCustomStartMonth: parseInt(cicloCustomMonth),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const fieldLabel = {
    fontSize: 11, color: '#6F7876', margin: '0 0 8px',
    fontFamily: 'DM Sans, sans-serif',
    textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500,
  }

  const inputStyle = {
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

  return (
    <div style={{ padding: '32px', maxWidth: 600, margin: '0 auto' }}>
      <button
        onClick={() => navigate('/')}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#6F7876', fontSize: 13, fontFamily: 'DM Sans, sans-serif',
          marginBottom: 28, padding: 0, transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#A3AEAC'}
        onMouseLeave={e => e.currentTarget.style.color = '#6F7876'}
      >
        <ArrowLeft size={15} strokeWidth={1.5} />
        Volver al pipeline
      </button>

      <h1
        className="font-clash"
        style={{ fontSize: 28, fontWeight: 700, color: '#F5F7F7', margin: '0 0 6px', letterSpacing: '-0.02em' }}
      >
        Perfil
      </h1>
      <p style={{ fontSize: 14, color: '#6F7876', margin: '0 0 32px', fontFamily: 'DM Sans, sans-serif' }}>
        Carlos · Channel Manager
      </p>

      <div style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        padding: '24px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      }}>
        <h2
          className="font-clash"
          style={{ fontSize: 13, fontWeight: 600, color: '#F5F7F7', margin: '0 0 20px', letterSpacing: '0.01em', textTransform: 'uppercase', opacity: 0.6 }}
        >
          Configuración de compensación
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Cuota trimestral */}
          <div>
            <p style={fieldLabel}>Cuota trimestral (USD)</p>
            <input
              type="text"
              value={cuota}
              onChange={e => setCuota(e.target.value)}
              placeholder="ej. 500,000"
              style={inputStyle}
            />
          </div>

          {/* Split salarial */}
          <div>
            <p style={fieldLabel}>Split salarial</p>
            <CustomDropdown
              value={split}
              onChange={setSplit}
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
                  <p style={{ ...fieldLabel, margin: '0 0 6px' }}>% Base</p>
                  <input
                    type="number" min="0" max="100"
                    value={basePercent}
                    onChange={e => setBasePercent(e.target.value)}
                    placeholder="60"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <p style={{ ...fieldLabel, margin: '0 0 6px' }}>% Variable</p>
                  <input
                    type="number" min="0" max="100"
                    value={variablePercent}
                    onChange={e => setVariablePercent(e.target.value)}
                    placeholder="40"
                    style={inputStyle}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Ciclo trimestral */}
          <div>
            <p style={fieldLabel}>Ciclo trimestral</p>
            <CustomDropdown
              value={ciclo}
              onChange={setCiclo}
              options={[
                { value: 'estandar', label: 'Estándar (Ene / Abr / Jul / Oct)' },
                { value: 'microsoft', label: 'Microsoft Fiscal Year (Jul / Oct / Ene / Abr)' },
                { value: 'personalizado', label: 'Personalizado' },
              ]}
            />
            {ciclo === 'personalizado' && (
              <div style={{ marginTop: 12 }}>
                <p style={{ ...fieldLabel, margin: '0 0 6px' }}>Inicio del trimestre</p>
                <CustomDropdown
                  value={cicloCustomMonth}
                  onChange={setCicloCustomMonth}
                  options={MONTHS_ES.map((m, i) => ({ value: String(i), label: m }))}
                />
              </div>
            )}
          </div>

          {/* Summary preview */}
          {cuotaNum > 0 && (
            <div style={{
              padding: '12px 14px',
              background: 'rgba(176,255,146,0.05)',
              border: '1px solid rgba(176,255,146,0.1)',
              borderRadius: 8,
            }}>
              <p style={{ fontSize: 12, color: '#A3AEAC', margin: 0, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.7 }}>
                Cuota:{' '}
                <span style={{ color: '#F5F7F7', fontWeight: 500 }}>
                  ${cuotaNum.toLocaleString('en-US')}
                </span>
                {'  ·  '}
                Variable:{' '}
                <span style={{ color: '#F5F7F7', fontWeight: 500 }}>{derivedVariable}%</span>
                {'  ·  '}
                Ciclo:{' '}
                <span style={{ color: '#F5F7F7', fontWeight: 500 }}>
                  {ciclo === 'estandar' ? 'Estándar' : ciclo === 'microsoft' ? 'Microsoft FY' : 'Personalizado'}
                </span>
              </p>
            </div>
          )}

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!canSave}
            style={{
              padding: '11px 0',
              background: saved ? 'rgba(176,255,146,0.15)' : canSave ? '#B0FF92' : 'rgba(255,255,255,0.06)',
              border: saved ? '1px solid rgba(176,255,146,0.3)' : 'none',
              borderRadius: 9,
              color: saved ? '#B0FF92' : canSave ? '#121716' : '#6F7876',
              fontSize: 14,
              fontWeight: 600,
              cursor: canSave ? 'pointer' : 'not-allowed',
              fontFamily: 'DM Sans, sans-serif',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.15s',
            }}
          >
            {saved && <CheckCircle2 size={15} strokeWidth={2} />}
            {saved ? 'Configuración guardada' : 'Guardar configuración'}
          </button>
        </div>
      </div>
    </div>
  )
}
