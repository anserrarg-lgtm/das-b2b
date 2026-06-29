import { useState } from 'react'
import { Upload, FileText, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'

const SOURCES = [
  { id: 'manual', label: 'Entrada manual', description: 'Agrega una oportunidad ingresando los datos manualmente', icon: FileText },
  { id: 'csv', label: 'Importar CSV', description: 'Sube un archivo .csv con tus oportunidades', icon: FileText },
  { id: 'salesforce', label: 'Conectar Salesforce', description: 'Importa oportunidades directamente desde Salesforce CRM', icon: () => <SFLogo /> },
  { id: 'hubspot', label: 'Conectar HubSpot', description: 'Sincroniza deals activos desde HubSpot', icon: () => <HSLogo /> },
  { id: 'excel', label: 'Importar Excel', description: 'Sube un archivo .xlsx con tu pipeline actual', icon: FileText },
]

export default function ImportScreen() {
  const { oportunidades } = useApp()
  const [dragging, setDragging] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [selectedSource, setSelectedSource] = useState(null)
  const [manualFormData, setManualFormData] = useState({
    nombre: '',
    cliente: '',
    partner: '',
    valor: '',
    producto: '',
    cantidad: '',
    fechaCierre: '',
  })
  const [partnerInput, setPartnerInput] = useState('')
  const [partnerSuggestions, setPartnerSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const existingPartners = [...new Set(oportunidades?.map(o => o.partner) || [])]

  const handlePartnerInput = (value) => {
    setPartnerInput(value)
    setManualFormData({ ...manualFormData, partner: value })
    if (value.length > 0) {
      const filtered = existingPartners.filter(p =>
        p.toLowerCase().includes(value.toLowerCase())
      )
      setPartnerSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    setUploaded(true)
  }

  return (
    <div style={{ padding: '32px', maxWidth: 680 }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1
          style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 300, fontSize: 48, color: '#F5F7F7', margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}
        >
          Importar
        </h1>
        <p style={{ fontSize: 14, color: '#6F7876', margin: '8px 0 0', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5 }}>
          Conecta tus fuentes de datos para comenzar a monitorear oportunidades con tus partners.
        </p>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragging ? 'rgba(176,255,146,0.4)' : uploaded ? 'rgba(176,255,146,0.25)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 16,
          padding: '48px 32px',
          textAlign: 'center',
          background: dragging
            ? 'rgba(176,255,146,0.04)'
            : uploaded
              ? 'rgba(176,255,146,0.02)'
              : 'rgba(255,255,255,0.02)',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          marginBottom: 28,
        }}
        onClick={() => !uploaded && setUploaded(true)}
      >
        {uploaded ? (
          <div>
            <CheckCircle2 size={40} color="#B0FF92" strokeWidth={1} style={{ marginBottom: 12 }} />
            <p className="font-clash" style={{ fontSize: 18, fontWeight: 600, color: '#B0FF92', margin: 0 }}>
              Archivo cargado correctamente
            </p>
            <p style={{ fontSize: 13, color: '#6F7876', margin: '6px 0 0', fontFamily: 'DM Sans, sans-serif' }}>
              20 oportunidades detectadas · Listo para importar
            </p>
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 10 }}>
              <button
                onClick={e => { e.stopPropagation(); setUploaded(false) }}
                style={{
                  padding: '8px 16px', borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'transparent', color: '#A3AEAC',
                  fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={e => e.stopPropagation()}
                style={{
                  padding: '8px 16px', borderRadius: 8,
                  border: '1px solid rgba(176,255,146,0.25)',
                  background: 'rgba(176,255,146,0.1)', color: '#B0FF92',
                  fontSize: 13, cursor: 'pointer', fontWeight: 500,
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                Confirmar importación
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Upload size={24} color="#6F7876" strokeWidth={1.5} />
            </div>
            <p className="font-clash" style={{ fontSize: 17, fontWeight: 600, color: '#F5F7F7', margin: 0 }}>
              Arrastra tu archivo aquí
            </p>
            <p style={{ fontSize: 13, color: '#6F7876', margin: '6px 0 0', fontFamily: 'DM Sans, sans-serif' }}>
              o haz clic para seleccionarlo desde tu equipo
            </p>
            <p style={{ fontSize: 12, color: '#6F7876', opacity: 0.6, margin: '12px 0 0', fontFamily: 'DM Sans, sans-serif' }}>
              Formatos soportados: CSV, Excel (.xlsx)
            </p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        <span style={{ fontSize: 12, color: '#6F7876', fontFamily: 'DM Sans, sans-serif' }}>o conecta una integración</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* Manual entry form */}
      {selectedSource === 'manual' && (
        <div style={{
          padding: '24px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12,
          marginBottom: 24,
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#F5F7F7', margin: '0 0 20px', fontFamily: 'DM Sans, sans-serif' }}>
            Agregar oportunidad manualmente
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Nombre de oportunidad
              </label>
              <input
                type="text"
                placeholder="ej. Expansión Microsoft 365"
                value={manualFormData.nombre}
                onChange={e => setManualFormData({ ...manualFormData, nombre: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  color: '#F5F7F7',
                  fontSize: 13,
                  fontFamily: 'DM Sans, sans-serif',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Cliente
              </label>
              <input
                type="text"
                placeholder="ej. Meridian Corp"
                value={manualFormData.cliente}
                onChange={e => setManualFormData({ ...manualFormData, cliente: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  color: '#F5F7F7',
                  fontSize: 13,
                  fontFamily: 'DM Sans, sans-serif',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: 11, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Partner
              </label>
              <input
                type="text"
                placeholder="ej. CloudBridge Partners"
                value={partnerInput}
                onChange={(e) => handlePartnerInput(e.target.value)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  color: '#F5F7F7',
                  fontSize: 13,
                  fontFamily: 'DM Sans, sans-serif',
                  boxSizing: 'border-box',
                }}
              />
              {showSuggestions && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#1A1F1E',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  zIndex: 9999,
                  overflow: 'hidden',
                  marginTop: 4
                }}>
                  {partnerSuggestions.map(partner => (
                    <div
                      key={partner}
                      onClick={() => {
                        setPartnerInput(partner)
                        setManualFormData({ ...manualFormData, partner })
                        setShowSuggestions(false)
                      }}
                      style={{
                        padding: '10px 14px',
                        cursor: 'pointer',
                        fontSize: 13,
                        color: '#A3AEAC',
                        fontFamily: 'DM Sans, sans-serif'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {partner}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Valor del contrato
              </label>
              <input
                type="number"
                placeholder="ej. 50000"
                value={manualFormData.valor}
                onChange={e => setManualFormData({ ...manualFormData, valor: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  color: '#F5F7F7',
                  fontSize: 13,
                  fontFamily: 'DM Sans, sans-serif',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Producto
              </label>
              <input
                type="text"
                placeholder="ej. WorkSpace Pro"
                value={manualFormData.producto}
                onChange={e => setManualFormData({ ...manualFormData, producto: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  color: '#F5F7F7',
                  fontSize: 13,
                  fontFamily: 'DM Sans, sans-serif',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Cantidad
              </label>
              <input
                type="text"
                placeholder="ej. 50 licencias"
                value={manualFormData.cantidad}
                onChange={e => setManualFormData({ ...manualFormData, cantidad: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  color: '#F5F7F7',
                  fontSize: 13,
                  fontFamily: 'DM Sans, sans-serif',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 11, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Fecha estimada de cierre
              </label>
              <input
                type="date"
                value={manualFormData.fechaCierre}
                onChange={e => setManualFormData({ ...manualFormData, fechaCierre: e.target.value })}
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
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              onClick={() => setSelectedSource(null)}
              style={{
                padding: '9px 18px', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent', color: '#A3AEAC',
                fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#F5F7F7'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#A3AEAC'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                console.log('Guardando oportunidad:', manualFormData)
                setManualFormData({ nombre: '', cliente: '', partner: '', valor: '', producto: '', cantidad: '', fechaCierre: '' })
                setSelectedSource(null)
              }}
              style={{
                padding: '9px 18px', borderRadius: 8,
                border: 'none',
                background: '#B0FF92', color: '#121716',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
            >
              Guardar oportunidad
            </button>
          </div>
        </div>
      )}

      {/* Integration sources */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SOURCES.map(source => {
          const Icon = source.icon
          const isSelected = selectedSource === source.id
          const isCRM = ['salesforce', 'hubspot'].includes(source.id)
          return (
            <div
              key={source.id}
              onClick={() => !isCRM && setSelectedSource(isSelected ? null : source.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px',
                background: isSelected ? 'rgba(176,255,146,0.04)' : isCRM ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.03)',
                border: isSelected ? '1px solid rgba(176,255,146,0.2)' : '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12,
                cursor: isCRM ? 'default' : 'pointer',
                opacity: isCRM ? 0.5 : 1,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                if (!isSelected && !isCRM) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                }
              }}
              onMouseLeave={e => {
                if (!isSelected && !isCRM) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                }
              }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 9,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#F5F7F7', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
                  {source.label}
                </p>
                <p style={{ fontSize: 12, color: '#6F7876', margin: '2px 0 0', fontFamily: 'DM Sans, sans-serif' }}>
                  {source.description}
                </p>
              </div>
              <ChevronRight size={16} color="#6F7876" strokeWidth={1.5} />
            </div>
          )
        })}
      </div>

      {/* Format requirements */}
      <div style={{
        marginTop: 28,
        padding: '16px',
        background: 'rgba(95,191,249,0.04)',
        border: '1px solid rgba(95,191,249,0.12)',
        borderRadius: 12,
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <AlertCircle size={15} color="#5FBFF9" strokeWidth={1.5} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#5FBFF9', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
              Formato requerido para CSV
            </p>
            <p style={{ fontSize: 12, color: '#6F7876', margin: '4px 0 0', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5 }}>
              El archivo debe incluir las columnas: <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>nombre</code>, <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>cliente</code>, <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>partner</code>, <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>valor</code>, <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>estado</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function SFLogo() {
  return (
    <svg width="18" height="13" viewBox="0 0 18 13" fill="none">
      <path d="M7.5 0C6.1 0 5 1.1 5 2.5c0 .2 0 .4.1.6C4.4 3 3.7 3 3 3.2 1.3 3.7 0 5.2 0 7c0 2.2 1.8 4 4 4h9c2.2 0 4-1.5 4-3.4 0-1.5-1-2.8-2.5-3.3C14.5 3.2 13.3 2 11.7 2c-.4 0-.8.1-1.1.2C10.1.9 8.9 0 7.5 0z" fill="#00A1E0"/>
    </svg>
  )
}

function HSLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill="#FF7A59"/>
      <path d="M6 5v6M10 5v6M6 8h4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
