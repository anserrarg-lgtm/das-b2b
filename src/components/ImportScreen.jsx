import { useState } from 'react'
import { Upload, FileText, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react'

const SOURCES = [
  { id: 'csv', label: 'Importar CSV', description: 'Sube un archivo .csv con tus oportunidades', icon: FileText },
  { id: 'salesforce', label: 'Conectar Salesforce', description: 'Importa oportunidades directamente desde Salesforce CRM', icon: () => <SFLogo /> },
  { id: 'hubspot', label: 'Conectar HubSpot', description: 'Sincroniza deals activos desde HubSpot', icon: () => <HSLogo /> },
  { id: 'excel', label: 'Importar Excel', description: 'Sube un archivo .xlsx con tu pipeline actual', icon: FileText },
]

export default function ImportScreen() {
  const [dragging, setDragging] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [selectedSource, setSelectedSource] = useState(null)

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

      {/* Integration sources */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SOURCES.filter(s => s.id !== 'csv' && s.id !== 'excel').map(source => {
          const Icon = source.icon
          const isSelected = selectedSource === source.id
          return (
            <div
              key={source.id}
              onClick={() => setSelectedSource(isSelected ? null : source.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px',
                background: isSelected ? 'rgba(176,255,146,0.04)' : 'rgba(255,255,255,0.03)',
                border: isSelected ? '1px solid rgba(176,255,146,0.2)' : '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                }
              }}
              onMouseLeave={e => {
                if (!isSelected) {
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
