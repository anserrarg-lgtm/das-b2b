import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Activity, Clock, AlertCircle, CheckCircle, Search, LayoutGrid, List, Upload, Download, TrendingUp, RotateCcw, Plus, Inbox } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { ESTADOS, ESTADO_CONFIG } from '../../data/mockData'
import OpportunityCard from './OpportunityCard'
import { useNavigate, useLocation } from 'react-router-dom'
import * as XLSX from 'xlsx'

const COLUMNS = [
  { id: ESTADOS.NUEVA,           ...ESTADO_CONFIG[ESTADOS.NUEVA],           descripcion: 'Recién agregada',                 icon: Inbox       },
  { id: ESTADOS.SIN_RESPUESTA,   ...ESTADO_CONFIG[ESTADOS.SIN_RESPUESTA],   descripcion: 'Sin actividad en 10+ días',       icon: AlertCircle },
  { id: ESTADOS.ESPERANDO,       ...ESTADO_CONFIG[ESTADOS.ESPERANDO],       descripcion: 'Pulse Check enviado',              icon: Clock       },
  { id: ESTADOS.RESPONDIDA,      ...ESTADO_CONFIG[ESTADOS.RESPONDIDA],      descripcion: 'Partner respondió',                icon: Activity    },
  { id: ESTADOS.VENTA_CONFIRMADA,...ESTADO_CONFIG[ESTADOS.VENTA_CONFIRMADA],descripcion: 'Venta cerrada por el partner',    icon: CheckCircle },
]

const ACTIVE_STATES = [ESTADOS.NUEVA, ESTADOS.RESPONDIDA, ESTADOS.ESPERANDO, ESTADOS.SIN_RESPUESTA, ESTADOS.VENTA_CONFIRMADA]

const FILTER_OPTIONS = [
  { value: 'todas',                    label: 'Todas'              },
  { value: ESTADOS.RESPONDIDA,         label: 'Respondida'         },
  { value: ESTADOS.ESPERANDO,          label: 'Esperando respuesta'},
  { value: ESTADOS.SIN_RESPUESTA,      label: 'Sin respuesta'      },
  { value: 'en_espera',               label: 'En espera'          },
  { value: ESTADOS.VENTA_CONFIRMADA,  label: 'Venta confirmada'   },
  { value: 'historial',                label: 'Historial'          },
]

function formatValor(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function formatFecha(str) {
  const d = new Date(str + 'T00:00:00')
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

export default function PipelineBoard() {
  const { oportunidades, setSelectedOportunidad, compensacion, reactivarDesdeHistorial, agregarOportunidad } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeFilter, setActiveFilter] = useState('todas')
  const [searchQuery, setSearchQuery] = useState(location.state?.partnerFilter || '')
  const [viewMode, setViewMode] = useState('board') // 'board' | 'list'
  const [confirmReactivar, setConfirmReactivar] = useState(null)
  const [toastMsg, setToastMsg] = useState(null)
  const [importModalState, setImportModalState] = useState(null) // null | 'upload' | 'processing' | 'preview'
  const [previewData, setPreviewData] = useState(null)
  const [importModalTab, setImportModalTab] = useState('subir') // 'subir' | 'crm' | 'manual'
  const [showNueva, setNueva] = useState(false)
  const [manualFormData, setManualFormData] = useState({
    nombre: '',
    cliente: '',
    partner: '',
    valor: '',
    tipoContrato: 'Anual',
    producto: '',
    cantidad: '',
    partnerEmail: '',
    notas: '',
  })
  const [partnerInput, setPartnerInput] = useState('')
  const [showPartnerSuggestions, setShowPartnerSuggestions] = useState(false)
  const [newPartnerEmail, setNewPartnerEmail] = useState('')

  const isHistorial = activeFilter === 'historial'

  const byEstado = COLUMNS.reduce((acc, col) => {
    const all = oportunidades.filter(o => o.estado === col.id)
    acc[col.id] = activeFilter === 'en_espera' ? all.filter(o => o.enEspera) : all
    return acc
  }, {})

  const totalSinRespuesta = byEstado[ESTADOS.SIN_RESPUESTA].length
  const totalEsperando    = byEstado[ESTADOS.ESPERANDO].length
  const totalVentas       = byEstado[ESTADOS.VENTA_CONFIRMADA].length
  const totalRespondidas  = byEstado[ESTADOS.RESPONDIDA].length
  const activeCount    = oportunidades.filter(o => ACTIVE_STATES.includes(o.estado) && !o.enEspera).length
  const enEsperaCount  = oportunidades.filter(o => o.enEspera && ACTIVE_STATES.includes(o.estado)).length

  const visibleColumns = (() => {
    let cols = []
    if (showNueva) {
      cols.push(COLUMNS[0]) // Nueva column first
    }
    if (activeFilter === 'todas' || isHistorial || activeFilter === 'en_espera') {
      cols = cols.concat(COLUMNS.slice(1)) // Add remaining 4 columns
    } else {
      cols = cols.concat(COLUMNS.filter(c => c.id === activeFilter))
    }
    return cols
  })()

  const q = searchQuery.trim().toLowerCase()
  function matchesSearch(op) {
    if (!q) return true
    return (
      op.nombre.toLowerCase().includes(q) ||
      op.cliente.toLowerCase().includes(q) ||
      op.partner.toLowerCase().includes(q)
    )
  }

  const historialRows = oportunidades
    .filter(o => o.estado === 'ganada' || o.estado === 'perdida')
    .filter(matchesSearch)
    .sort((a, b) => {
      const da = new Date((b.fechaCierre || b.ultimaActividad) + 'T00:00:00')
      const db = new Date((a.fechaCierre || a.ultimaActividad) + 'T00:00:00')
      return da - db
    })

  const filteredByStatus = isHistorial
    ? []
    : activeFilter === 'en_espera'
      ? oportunidades.filter(o => o.enEspera && ACTIVE_STATES.includes(o.estado))
      : activeFilter === 'todas'
        ? oportunidades.filter(o => ACTIVE_STATES.includes(o.estado))
        : oportunidades.filter(o => o.estado === activeFilter)

  const listRows = filteredByStatus.filter(matchesSearch)

  // Auto-transition processing state to preview after 2 seconds
  useEffect(() => {
    if (importModalState === 'processing') {
      const timer = setTimeout(() => {
        setImportModalState('preview')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [importModalState])

  const handleManualFormChange = (field, value) => {
    setManualFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleManualFormSubmit = () => {
    if (!manualFormData.nombre.trim() || !manualFormData.cliente.trim() || !manualFormData.partner) {
      alert('Por favor completa los campos requeridos')
      return
    }

    const newOp = {
      id: String(oportunidades.length + 1),
      nombre: manualFormData.nombre,
      cliente: manualFormData.cliente,
      partner: manualFormData.partner,
      valor: parseInt(manualFormData.valor) || 0,
      tipoContrato: manualFormData.tipoContrato,
      producto: manualFormData.producto,
      cantidad: manualFormData.cantidad,
      partnerEmail: manualFormData.partnerEmail,
      estado: 'nueva',
      ultimaActividad: new Date().toISOString().split('T')[0],
      diasSinRespuesta: 0,
      nota: manualFormData.notas,
      pulseChecks: [],
      timeline: [],
      automatico: true,
      proximoPulse: null,
    }

    agregarOportunidad(newOp)
    setToastMsg('Oportunidad agregada al pipeline')
    setImportModalState(null)
    setImportModalTab('subir')
    setManualFormData({ nombre: '', cliente: '', partner: '', valor: '', tipoContrato: 'Anual', producto: '', cantidad: '', partnerEmail: '', notas: '' })
    setNewPartnerEmail('')
    setTimeout(() => setToastMsg(null), 3000)
  }

  const partners = [...new Set(oportunidades.map(o => o.partner))].sort()

  const handleImportFileSelected = (file) => {
    setImportModalState('processing')
  }

  const handleImportConfirm = () => {
    if (previewData) {
      previewData.forEach(op => {
        agregarOportunidad(op)
      })
      setToastMsg(`${previewData.length} oportunidades importadas exitosamente`)
      setImportModalState(null)
      setPreviewData(null)
      setTimeout(() => setToastMsg(null), 3000)
    }
  }

  const exportToExcel = (opportunities) => {
    const data = opportunities.map(op => ({
      'Oportunidad': op.nombre,
      'Cliente': op.cliente,
      'Partner': op.partner,
      'Valor': op.valor,
      'Contrato': op.tipoContrato,
      'Estado': op.estado,
      'Última actividad': op.ultimaActividad
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Pipeline')
    XLSX.writeFile(wb, 'beacon-pipeline.xlsx')
    setToastMsg('Pipeline exportado exitosamente')
    setTimeout(() => setToastMsg(null), 3000)
  }

  const previewRows = [
    { nombre: 'Renovación Azure', cliente: 'Bancolombia', partner: 'TechSolutions', valor: 45000, tipoContrato: 'Anual', estado: 'nueva' },
    { nombre: 'Microsoft 365 E3', cliente: 'Grupo Éxito', partner: 'Nimbus Partners', valor: 28000, tipoContrato: 'Mensual', estado: 'nueva' },
    { nombre: 'Defender Security', cliente: 'Claro Colombia', partner: 'NetCore Solutions', valor: 67000, tipoContrato: '3 años', estado: 'nueva' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

      {/* Welcome header */}
      <div style={{ padding: '24px 40px 0' }}>
        <p style={{
          fontSize: 11, color: '#6F7876', margin: '0 0 10px',
          fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
          textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>
          Centro de control
        </p>
        <h1 style={{
          fontFamily: "'Satoshi', sans-serif",
          fontSize: 56, fontWeight: 300, color: '#F5F7F7',
          margin: '8px 0 0', letterSpacing: '-0.025em', lineHeight: 1.05,
        }}>
          Buenos días, Carlos
        </h1>
        <p style={{
          fontSize: 15, color: '#A3AEAC', margin: '10px 0 0',
          fontFamily: 'DM Sans, sans-serif', fontWeight: 400, lineHeight: 1.5,
        }}>
          {totalSinRespuesta > 0
            ? `${totalSinRespuesta} oportunidades requieren atención inmediata.`
            : 'Todo el pipeline está bajo control.'}
        </p>
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
          margin: '24px 0 0',
        }} />
      </div>

      {/* Pipeline activo label + action buttons */}
      <div style={{ padding: '0 40px', marginTop: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p className="font-clash" style={{
            fontSize: 20, color: '#A3AEAC', margin: 0,
          }}>
            Pipeline activo
          </p>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 400,
            fontSize: 13,
            color: '#6F7876',
            marginTop: 4,
            margin: '4px 0 0 0',
          }}>
            Seguimiento en tiempo real de tus oportunidades con partners
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => {
              setImportModalState('upload')
              setImportModalTab('subir')
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '0 16px', height: 36,
              background: '#B0FF92', border: 'none', borderRadius: 8,
              color: '#121716', fontSize: 13, fontWeight: 600,
              fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
          >
            <Upload size={14} strokeWidth={2} />
            Importar
          </button>
          <button
            onClick={() => exportToExcel(oportunidades)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '0 16px', height: 36,
              background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8,
              color: '#F5F7F7', fontSize: 13, fontWeight: 400,
              fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
          >
            <Download size={14} strokeWidth={1.5} />
            Exportar
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ padding: '0 40px', marginTop: 16, display: 'flex', gap: 12 }}>
        <MetricCard icon={AlertCircle} label="Sin respuesta"    value={totalSinRespuesta} color="#F97316" />
        <MetricCard icon={Clock}       label="Esperando"        value={totalEsperando}    color="#7B58F8" />
        <MetricCard icon={Activity}    label="Respondidas"      value={totalRespondidas}  color="#B0FF92" />
        <MetricCard icon={CheckCircle} label="Venta confirmada" value={totalVentas}       color="#5FBFF9" />
        <BonoCard oportunidades={oportunidades} compensacion={compensacion} />
      </div>

      {/* Row 1 — Filter pills + view toggle */}
      <div style={{ padding: '0 40px', marginTop: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Filter pills */}
        <div style={{
          display: 'inline-flex',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 8,
          padding: 4,
          gap: 2,
        }}>
          {FILTER_OPTIONS.map(opt => {
            const isActive = activeFilter === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setActiveFilter(opt.value)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 6,
                  border: 'none',
                  background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                  color: isActive ? '#F5F7F7' : '#A3AEAC',
                  fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                  transition: 'all 0.15s ease', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#F5F7F7' } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#A3AEAC' } }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        {/* Right side: view toggle — hidden in historial */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, visibility: isHistorial ? 'hidden' : 'visible' }}>
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10, padding: 3, gap: 2,
          }}>
            {[
              { mode: 'board', Icon: LayoutGrid, title: 'Vista tablero' },
              { mode: 'list',  Icon: List,       title: 'Vista lista'   },
            ].map(({ mode, Icon, title }) => {
              const isActive = viewMode === mode
              return (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  title={title}
                  style={{
                    width: 32, height: 32,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 7,
                    border: isActive ? '1px solid rgba(176,255,146,0.25)' : '1px solid transparent',
                    background: isActive ? 'rgba(176,255,146,0.1)' : 'transparent',
                    color: isActive ? '#B0FF92' : '#6F7876',
                    cursor: 'pointer', transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = '#A3AEAC'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = '#6F7876'; e.currentTarget.style.background = 'transparent' } }}
                >
                  <Icon size={15} strokeWidth={1.5} />
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Row 2 — Search bar */}
      <div style={{ padding: '0 40px', marginTop: 12 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 10, padding: '9px 14px',
        }}>
          <Search size={15} color="#6F7876" strokeWidth={1.5} style={{ flexShrink: 0 }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar oportunidad, cliente o partner..."
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#F5F7F7', fontSize: 13, fontFamily: 'DM Sans, sans-serif',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', color: '#6F7876', cursor: 'pointer', padding: 0, fontSize: 16, lineHeight: 1 }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Count + board block */}
      <div style={{ marginTop: 32 }}>
        <div style={{ padding: '0 40px', margin: '0 0 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <p style={{ margin: 0, fontSize: 12, color: '#6F7876', fontFamily: 'DM Sans, sans-serif' }}>
              {isHistorial ? `${historialRows.length} en historial` : activeFilter === 'en_espera' ? `${enEsperaCount} en espera` : `${activeCount} oportunidades activas`}
            </p>
            {!isHistorial && !['en_espera'].includes(activeFilter) && (() => {
              const nuevaCount = byEstado[ESTADOS.NUEVA].length
              return (
                <button onClick={() => navigate('/nuevas')} style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  color: '#A3AEAC',
                  fontFamily: 'DM Sans',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Inbox size={13}/>
                  Ver recién cargadas
                  <span style={{
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '4px',
                    padding: '1px 6px',
                    color: '#F5F7F7',
                    fontFamily: 'Satoshi',
                    fontWeight: 700,
                    fontSize: '11px'
                  }}>{nuevaCount}</span>
                </button>
              )
            })()}
          </div>
        </div>

        {/* Board view */}
        {!isHistorial && viewMode === 'board' && activeFilter === 'todas' && (
          <div style={{
            padding: '0 40px 48px',
            display: 'flex',
            flexDirection: 'row',
            gap: 12,
            alignItems: 'flex-start',
            width: '100%',
            overflowX: 'auto',
          }}>
            {visibleColumns.map(col => {
              const cards = byEstado[col.id].filter(matchesSearch)
              const isNuevaCol = col.id === ESTADOS.NUEVA
              return (
                <div key={col.id} style={isNuevaCol ? {
                  transition: 'all 0.3s ease',
                  opacity: showNueva ? 1 : 0,
                  width: showNueva ? 'auto' : '0px',
                  overflow: 'hidden',
                  flex: 1,
                  minWidth: 0,
                } : {
                  flex: 1,
                  minWidth: 0,
                }}>
                  <Column col={col} cards={cards} />
                </div>
              )
            })}
          </div>
        )}

        {/* Filtered column view - when filter is not "todas" */}
        {!isHistorial && activeFilter !== 'todas' && (() => {
          const col = COLUMNS.find(c => c.id === activeFilter || (activeFilter === 'en_espera' && c.id === ESTADOS.ESPERANDO))
          if (!col) return null

          const cards = activeFilter === 'en_espera'
            ? byEstado[ESTADOS.ESPERANDO]
            : byEstado[col.id]

          const filteredCards = cards.filter(matchesSearch)
          const rgb = col.color.match(/\d+/g)?.join(',') || '123,88,248'

          return (
            <div style={{
              padding: '0 40px 48px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}>
              {/* Column Header */}
              <div style={{
                marginBottom: 24,
                paddingBottom: 16,
                borderBottom: `1px solid rgba(${rgb},0.1)`,
                width: '100%',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8,
                }}>
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: `rgba(${rgb},0.1)`,
                    border: `1px solid rgba(${rgb},0.2)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {col.icon && <col.icon size={12} color={col.color} strokeWidth={1.5} />}
                  </div>
                  <p style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: col.color,
                    margin: 0,
                    fontFamily: 'DM Sans, sans-serif',
                  }}>
                    {col.label}
                  </p>
                  <p style={{
                    fontSize: 12,
                    color: '#6F7876',
                    margin: 0,
                    fontFamily: 'DM Sans, sans-serif',
                  }}>
                    ({filteredCards.length})
                  </p>
                </div>
                <p style={{
                  fontSize: 13,
                  color: '#A3AEAC',
                  margin: 0,
                  fontFamily: 'DM Sans, sans-serif',
                  lineHeight: 1.5,
                }}>
                  {col.descripcion}
                </p>
              </div>

              {/* Cards */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                maxWidth: 380,
              }}>
                {filteredCards.map(op => (
                  <OpportunityCard key={op.id} oportunidad={op} />
                ))}
              </div>
            </div>
          )
        })()}

        {/* List view */}
        {!isHistorial && viewMode === 'list' && (
          <div style={{ padding: '0 40px 48px' }}>
            <ListView rows={listRows} onSelect={(op) => { setSelectedOportunidad(op); navigate(`/oportunidad/${op.id}`) }} />
          </div>
        )}

        {/* Historial view */}
        {isHistorial && (
          <div style={{ padding: '0 40px 48px' }}>
            <HistorialView
              rows={historialRows}
              onSelect={(op) => { setSelectedOportunidad(op); navigate(`/oportunidad/${op.id}`) }}
              onReactivar={(op) => setConfirmReactivar(op)}
            />
          </div>
        )}
      </div>

      {/* Reactivar confirmation modal */}
      {confirmReactivar && createPortal(
        <div
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setConfirmReactivar(null)}
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
            <h3 className="font-clash" style={{ fontSize: 18, fontWeight: 700, color: '#F5F7F7', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              ¿Reactivar esta oportunidad?
            </h3>
            <p style={{ fontSize: 14, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', margin: '0 0 6px', lineHeight: 1.5 }}>
              <span style={{ color: '#A3AEAC', fontWeight: 500 }}>{confirmReactivar.cliente}</span>
            </p>
            <p style={{ fontSize: 13, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', margin: '0 0 24px', lineHeight: 1.5 }}>
              Volverá al pipeline como{' '}
              <span style={{ color: '#B0FF92', fontWeight: 500 }}>
                {ESTADO_CONFIG[confirmReactivar.previousStatus]?.label || 'Respondida'}
              </span>
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmReactivar(null)}
                style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#A3AEAC', fontSize: 13, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#F5F7F7'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#A3AEAC'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  reactivarDesdeHistorial(confirmReactivar.id)
                  setConfirmReactivar(null)
                  setToastMsg('Oportunidad reactivada y de vuelta en el pipeline')
                  setTimeout(() => setToastMsg(null), 3000)
                }}
                style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: '#B0FF92', color: '#121716', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', transition: 'opacity 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.88' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              >
                Reactivar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 32, right: 40, zIndex: 9995,
          background: 'rgba(18,23,22,0.96)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(176,255,146,0.2)',
          borderRadius: 10, padding: '12px 18px',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(176,255,146,0.06)',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#B0FF92', boxShadow: '0 0 8px #B0FF92', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#F5F7F7', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>
            {toastMsg}
          </span>
        </div>
      )}

      {/* Import Modal */}
      {importModalState && createPortal(
        <div
          style={{
            position: 'fixed', top: 0, left: 0,
            width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.75)',
            zIndex: 99999,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          onClick={() => importModalState === 'upload' && setImportModalState(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '520px',
              background: 'rgba(18,23,22,0.97)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '28px',
              backdropFilter: 'blur(24px)',
              overflowY: 'auto',
              maxHeight: '90vh',
            }}
          >
            {/* TAB NAVIGATION */}
            {importModalState === 'upload' && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 28, background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: 4 }}>
                {[
                  { id: 'subir', label: 'Subir archivo' },
                  { id: 'crm', label: 'Conectar CRM' },
                  { id: 'manual', label: 'Agregar manualmente' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setImportModalTab(tab.id)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: 'none',
                      background: importModalTab === tab.id ? 'rgba(176,255,146,0.12)' : 'transparent',
                      color: importModalTab === tab.id ? '#B0FF92' : '#A3AEAC',
                      fontSize: 12,
                      fontFamily: 'DM Sans, sans-serif',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { if (importModalTab !== tab.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                    onMouseLeave={e => { if (importModalTab !== tab.id) e.currentTarget.style.background = 'transparent' }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* TAB 1 — SUBIR ARCHIVO */}
            {importModalState === 'upload' && importModalTab === 'subir' && (
              <>
                {/* UPLOAD STATES */}
                {!['processing', 'preview'].includes(importModalState) && (
                  <>
                    <h2 className="font-clash" style={{ fontSize: 18, fontWeight: 700, color: '#F5F7F7', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                      Importar oportunidades
                    </h2>
                    <p style={{ fontSize: 13, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', margin: '0 0 20px' }}>
                      Sube un archivo CSV o Excel con tus oportunidades activas
                    </p>

                    <div
                      onClick={() => setImportModalState('processing')}
                      style={{
                        border: '2px dashed rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        padding: '40px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        marginBottom: 20,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'transparent' }}
                    >
                      <Upload size={32} color="#6F7876" style={{ margin: '0 auto 12px', display: 'block' }} />
                      <p style={{ fontSize: 14, color: '#A3AEAC', fontFamily: 'DM Sans, sans-serif', margin: 0 }}>Arrastra tu archivo aquí</p>
                      <p style={{ fontSize: 13, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', margin: '4px 0' }}>o</p>
                      <button
                        style={{
                          background: 'transparent',
                          border: '1px solid rgba(255,255,255,0.15)',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          color: '#F5F7F7',
                          fontSize: 13,
                          fontFamily: 'DM Sans, sans-serif',
                          cursor: 'pointer',
                          marginTop: 8,
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = 'transparent' }}
                      >
                        Seleccionar archivo
                      </button>
                    </div>

                    <p style={{ fontSize: 11, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', margin: 0 }}>
                      Columnas requeridas: Cliente, Partner, Correo del partner, Valor, Contrato, Producto, Cantidad
                    </p>
                  </>
                )}
              </>
            )}

            {/* TAB 2 — CONECTAR CRM */}
            {importModalState === 'upload' && importModalTab === 'crm' && (
              <>
                <p style={{ fontSize: 13, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', margin: '0 0 8px' }}>
                  Conecta tu CRM
                </p>
                <p style={{ fontSize: 13, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', margin: '0 0 20px' }}>
                  Importa tus oportunidades directamente desde tu plataforma de ventas
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                  {[
                    { name: 'Salesforce', logo: 'SF', color: '#00A1E0', desc: 'Importa oportunidades y contactos desde tu CRM' },
                    { name: 'HubSpot', logo: 'HS', color: '#FF7A59', desc: 'Sincroniza deals y pipelines desde HubSpot' },
                    { name: 'Dynamics 365', logo: 'D365', color: '#742774', desc: 'Conecta con el ecosistema Microsoft de tu empresa' },
                  ].map(crm => (
                    <div
                      key={crm.name}
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '10px',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <div
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '8px',
                          background: `rgba(${crm.color === '#00A1E0' ? '0,161,224' : crm.color === '#FF7A59' ? '255,122,89' : '116,39,116'},0.1)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 700, color: crm.color, fontFamily: 'DM Sans, sans-serif' }}>
                          {crm.logo}
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p className="font-clash" style={{ fontSize: 15, fontWeight: 700, color: '#F5F7F7', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
                          {crm.name}
                        </p>
                        <p style={{ fontSize: 12, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', margin: 0 }}>
                          {crm.desc}
                        </p>
                      </div>
                      <button
                        style={{
                          padding: '6px 14px',
                          borderRadius: '6px',
                          border: 'none',
                          background: 'rgba(255,255,255,0.08)',
                          color: '#A3AEAC',
                          fontSize: 12,
                          fontFamily: 'DM Sans, sans-serif',
                          cursor: 'default',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s',
                          flexShrink: 0,
                          opacity: 0.6,
                        }}
                      >
                        Conectar
                      </button>
                      <div
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: 'rgba(245,185,66,0.1)',
                          border: '1px solid rgba(245,185,66,0.2)',
                          fontSize: 11,
                          color: '#F5B942',
                          fontFamily: 'DM Sans, sans-serif',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}
                      >
                        Próximamente
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* TAB 3 — AGREGAR MANUALMENTE */}
            {importModalState === 'upload' && importModalTab === 'manual' && (
              <>
                <p style={{ fontSize: 13, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', margin: '0 0 20px' }}>
                  Nueva oportunidad
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Cliente */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', marginBottom: 6, fontWeight: 500 }}>
                      Cliente *
                    </label>
                    <input
                      type="text"
                      value={manualFormData.cliente}
                      onChange={e => handleManualFormChange('cliente', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 8,
                        color: '#F5F7F7',
                        fontSize: 13,
                        fontFamily: 'DM Sans, sans-serif',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Partner */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', marginBottom: 6, fontWeight: 500 }}>
                      Partner *
                    </label>
                    <div style={{position: 'relative'}}>
                      <input
                        value={partnerInput}
                        onChange={(e) => {
                          setPartnerInput(e.target.value)
                          setManualFormData({ ...manualFormData, partner: e.target.value })
                          setShowPartnerSuggestions(e.target.value.length > 0)
                        }}
                        onBlur={() => setTimeout(() => setShowPartnerSuggestions(false), 200)}
                        placeholder="Nombre del partner"
                        style={{
                          width: '100%',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          color: '#F5F7F7',
                          fontFamily: 'DM Sans',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          outline: 'none'
                        }}
                      />
                      {showPartnerSuggestions && (() => {
                        const partnerList = [...new Set(oportunidades.map(o => o.partner))]
                        const filteredPartners = partnerList.filter(p =>
                          p.toLowerCase().includes(partnerInput.toLowerCase())
                        )
                        return filteredPartners.length > 0 && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: '#1A1F1E',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '8px',
                            zIndex: 9999,
                            marginTop: '4px',
                            overflow: 'hidden'
                          }}>
                            {filteredPartners.map(partner => (
                              <div
                                key={partner}
                                onMouseDown={() => {
                                  setPartnerInput(partner)
                                  setManualFormData({ ...manualFormData, partner })
                                  setShowPartnerSuggestions(false)
                                }}
                                style={{
                                  padding: '10px 14px',
                                  cursor: 'pointer',
                                  color: '#A3AEAC',
                                  fontFamily: 'DM Sans',
                                  fontSize: '13px'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                {partner}
                              </div>
                            ))}
                          </div>
                        )
                      })()}
                    </div>
                  </div>

                  {/* Correo del partner */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', marginBottom: 6, fontWeight: 500 }}>
                      Correo del partner
                    </label>
                    <input
                      type="email"
                      value={manualFormData.partnerEmail}
                      onChange={e => handleManualFormChange('partnerEmail', e.target.value)}
                      placeholder="ej. contacto@partner.com"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 8,
                        color: '#F5F7F7',
                        fontSize: 13,
                        fontFamily: 'DM Sans, sans-serif',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Valor */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', marginBottom: 6, fontWeight: 500 }}>
                      Valor del contrato (USD)
                    </label>
                    <input
                      type="number"
                      value={manualFormData.valor}
                      onChange={e => handleManualFormChange('valor', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 8,
                        color: '#F5F7F7',
                        fontSize: 13,
                        fontFamily: 'DM Sans, sans-serif',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Tipo de contrato */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', marginBottom: 6, fontWeight: 500 }}>
                      Tipo de contrato
                    </label>
                    <select
                      value={manualFormData.tipoContrato}
                      onChange={e => handleManualFormChange('tipoContrato', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 8,
                        color: '#F5F7F7',
                        fontSize: 13,
                        fontFamily: 'DM Sans, sans-serif',
                        outline: 'none',
                        boxSizing: 'border-box',
                        cursor: 'pointer',
                      }}
                    >
                      <option>Mensual</option>
                      <option>Anual</option>
                      <option>3 años</option>
                    </select>
                  </div>

                  {/* Producto */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', marginBottom: 6, fontWeight: 500 }}>
                      Producto
                    </label>
                    <input
                      type="text"
                      placeholder="ej. WorkSpace Pro"
                      value={manualFormData.producto}
                      onChange={e => handleManualFormChange('producto', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 8,
                        color: '#F5F7F7',
                        fontSize: 13,
                        fontFamily: 'DM Sans, sans-serif',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Cantidad */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', marginBottom: 6, fontWeight: 500 }}>
                      Cantidad
                    </label>
                    <input
                      type="text"
                      placeholder="ej. 50 licencias"
                      value={manualFormData.cantidad}
                      onChange={e => handleManualFormChange('cantidad', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 8,
                        color: '#F5F7F7',
                        fontSize: 13,
                        fontFamily: 'DM Sans, sans-serif',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Notas */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', marginBottom: 6, fontWeight: 500 }}>
                      Notas iniciales
                    </label>
                    <textarea
                      value={manualFormData.notas}
                      onChange={e => handleManualFormChange('notas', e.target.value)}
                      placeholder="Contexto de la oportunidad..."
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
                        outline: 'none',
                        boxSizing: 'border-box',
                        resize: 'vertical',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
                  <button
                    onClick={() => setImportModalState(null)}
                    style={{
                      padding: '9px 18px', borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'transparent', color: '#A3AEAC',
                      fontSize: 13, fontFamily: 'DM Sans, sans-serif',
                      cursor: 'pointer', transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#F5F7F7'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#A3AEAC'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleManualFormSubmit}
                    style={{
                      padding: '9px 18px', borderRadius: 8,
                      border: 'none', background: '#B0FF92',
                      color: '#121716', fontSize: 13, fontWeight: 600,
                      fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
                      transition: 'opacity 0.15s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.88' }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                  >
                    Agregar oportunidad
                  </button>
                </div>
              </>
            )}

            {/* PROCESSING STATE */}
            {importModalState === 'processing' && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div
                  style={{
                    width: '40px', height: '40px',
                    border: '3px solid rgba(176,255,146,0.2)',
                    borderTop: '3px solid #B0FF92',
                    borderRadius: '50%',
                    margin: '0 auto 16px',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                <p style={{ fontSize: 14, color: '#A3AEAC', fontFamily: 'DM Sans, sans-serif', margin: 0 }}>
                  Procesando archivo...
                </p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {/* PREVIEW STATE */}
            {importModalState === 'preview' && (
              <>
                <h2 className="font-clash" style={{ fontSize: 18, fontWeight: 700, color: '#F5F7F7', margin: '0 0 20px', letterSpacing: '-0.02em' }}>
                  3 oportunidades encontradas
                </h2>

                <div style={{ overflowX: 'auto', marginBottom: 24 }}>
                  <div style={{ display: 'flex', gap: 24, paddingBottom: 12, fontSize: 11, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.04)', marginBottom: 12 }}>
                    <div style={{ flex: '1 0 140px' }}>Oportunidad</div>
                    <div style={{ flex: '1 0 120px' }}>Cliente</div>
                    <div style={{ flex: '1 0 120px' }}>Partner</div>
                    <div style={{ flex: '0 0 80px' }}>Valor</div>
                    <div style={{ flex: '0 0 70px' }}>Contrato</div>
                  </div>

                  {previewRows.map((row, i) => (
                    <div key={i} style={{ display: 'flex', gap: 24, paddingBottom: 12, paddingTop: 12, fontSize: 13, color: '#F5F7F7', fontFamily: 'DM Sans, sans-serif', borderBottom: i < previewRows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                      <div style={{ flex: '1 0 140px', minWidth: 0 }}>{row.nombre}</div>
                      <div style={{ flex: '1 0 120px', minWidth: 0 }}>{row.cliente}</div>
                      <div style={{ flex: '1 0 120px', minWidth: 0 }}>{row.partner}</div>
                      <div style={{ flex: '0 0 80px' }}>${(row.valor / 1000).toFixed(0)}K</div>
                      <div style={{ flex: '0 0 70px' }}>{row.tipoContrato}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setImportModalState(null)}
                    style={{
                      padding: '9px 18px', borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'transparent', color: '#A3AEAC',
                      fontSize: 13, fontFamily: 'DM Sans, sans-serif',
                      cursor: 'pointer', transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#F5F7F7'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#A3AEAC'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      setPreviewData(previewRows)
                      handleImportConfirm()
                    }}
                    style={{
                      padding: '9px 18px', borderRadius: 8,
                      border: 'none', background: '#B0FF92',
                      color: '#121716', fontSize: 13, fontWeight: 600,
                      fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
                      transition: 'opacity 0.15s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.88' }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                  >
                    Importar 3 oportunidades
                  </button>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

const MONTHS_ES_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const MONTHS_ES_FULL  = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function getPeriodBounds(compensacion) {
  const now    = new Date()
  const year   = now.getFullYear()
  const month  = now.getMonth()
  const periodo = compensacion?.periodo || 'mensual'

  if (periodo === 'trimestral') {
    const q = Math.floor(month / 3)
    const s = q * 3
    return {
      title: 'Rendimiento trimestral',
      label: `Q${q + 1} · ${MONTHS_ES_SHORT[s]}-${MONTHS_ES_SHORT[s + 2]}`,
      start: new Date(year, s, 1),
      end:   new Date(year, s + 3, 0),
    }
  }
  if (periodo === 'semestral') {
    const h = month < 6 ? 0 : 1
    const s = h * 6
    return {
      title: 'Rendimiento semestral',
      label: `H${h + 1} · ${MONTHS_ES_SHORT[s]}-${MONTHS_ES_SHORT[s + 5]}`,
      start: new Date(year, s, 1),
      end:   new Date(year, s + 6, 0),
    }
  }
  if (periodo === 'anual') {
    return {
      title: 'Rendimiento anual',
      label: `Año ${year}`,
      start: new Date(year, 0, 1),
      end:   new Date(year, 11, 31),
    }
  }
  if (periodo === 'personalizado') {
    const ini = compensacion?.periodoInicio
    const fin = compensacion?.periodoFin
    if (ini && fin) {
      const fmt = d => new Date(d + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
      return {
        title: 'Rendimiento del período',
        label: `${fmt(ini)} — ${fmt(fin)}`,
        start: new Date(ini + 'T00:00:00'),
        end:   new Date(fin + 'T00:00:00'),
      }
    }
  }
  return {
    title: 'Rendimiento mensual',
    label: `Este mes · ${MONTHS_ES_FULL[month]}`,
    start: new Date(year, month, 1),
    end:   new Date(year, month + 1, 0),
  }
}

function BonoCard({ oportunidades, compensacion }) {
  const navigate = useNavigate()

  const cardBase = {
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: '16px 20px',
    flex: 1,
    minWidth: 160,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
  }

  const { label, title, start, end } = getPeriodBounds(compensacion)

  const topRow = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <p className="font-clash" style={{ fontSize: 11, color: '#A3AEAC', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {title}
      </p>
      <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, background: 'rgba(176,255,146,0.1)', boxShadow: '0 0 8px rgba(176,255,146,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <TrendingUp size={28} color="#B0FF92" strokeWidth={1.5} />
      </div>
    </div>
  )

  if (!compensacion) {
    return (
      <div style={cardBase}>
        {topRow}
        <p style={{ fontSize: 12, color: '#6F7876', margin: 'auto 0 0', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6 }}>
          Configura tu cuota en Perfil para ver tu rendimiento mensual.{' '}
          <span onClick={() => navigate('/perfil')} style={{ color: '#B0FF92', cursor: 'pointer' }}>
            Ir al perfil →
          </span>
        </p>
      </div>
    )
  }

  const { cuota, variablePercent } = compensacion

  const ganadasValue = oportunidades
    .filter(op => {
      if (op.estado !== 'ganada') return false
      const d = new Date((op.fechaCierre || op.ultimaActividad) + 'T00:00:00')
      return d >= start && d <= end
    })
    .reduce((sum, op) => sum + op.valor, 0)

  const ventaConfirmadaValue = oportunidades
    .filter(op => op.estado === 'venta_confirmada')
    .reduce((sum, op) => sum + op.valor, 0)

  const confirmedBonus  = ganadasValue * (variablePercent / 100)
  const proyectedBonus  = (ganadasValue + ventaConfirmadaValue) * (variablePercent / 100)
  const progressPct     = cuota > 0 ? (ganadasValue / cuota) * 100 : 0
  const progressColor   = progressPct >= 100 ? '#B0FF92' : progressPct >= 50 ? '#F5B942' : '#FF6B6B'

  return (
    <div style={cardBase}>
      {topRow}

      {/* Bono confirmado */}
      <div style={{ marginTop: 16 }}>
        <p style={{ fontSize: 12, color: '#6F7876', margin: '0 0 2px', fontFamily: 'DM Sans, sans-serif' }}>Bono confirmado</p>
        <p className="font-clash" style={{ fontSize: 32, fontWeight: 700, color: '#B0FF92', margin: 0, lineHeight: 1, letterSpacing: '-0.025em' }}>
          {formatValor(confirmedBonus)}
        </p>
      </div>

      {/* Proyección */}
      <div style={{ marginTop: 10 }}>
        <p style={{ fontSize: 12, color: '#6F7876', margin: '0 0 2px', fontFamily: 'DM Sans, sans-serif' }}>Con pipeline actual</p>
        <p className="font-clash" style={{ fontSize: 24, fontWeight: 600, color: '#F5F7F7', margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>
          {formatValor(proyectedBonus)}
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: 14, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(progressPct, 100)}%`, background: progressColor, borderRadius: 2 }} />
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <p style={{ fontSize: 12, color: '#6F7876', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
          {label}
        </p>
        <p style={{ fontSize: 12, color: '#6F7876', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
          {Math.min(progressPct, 999).toFixed(0)}% de cuota
        </p>
      </div>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, color }) {
  const rgb = hexToRgb(color)
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12, padding: '16px 20px',
      flex: 1, minWidth: 130,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Row 1: label + icon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{
          fontSize: 13, color: '#6F7876', margin: 0,
          fontFamily: 'Satoshi, sans-serif', fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          {label}
        </p>
        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          background: `rgba(${rgb},0.1)`,
          boxShadow: `0 0 8px rgba(${rgb},0.2)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={28} color={color} strokeWidth={1.5} />
        </div>
      </div>
      {/* Row 2: large number */}
      <p className="font-clash" style={{ fontSize: 36, fontWeight: 700, color: '#F5F7F7', margin: '26px 0 0', lineHeight: 1, letterSpacing: '-0.025em' }}>
        {value}
      </p>
    </div>
  )
}

function Column({ col, cards }) {
  const totalValue = cards.reduce((sum, c) => sum + c.valor, 0)
  const rgb = hexToRgb(col.color)
  const Icon = col.icon
  const isNueva = col.id === ESTADOS.NUEVA
  const labelColor = isNueva ? '#C8CDD0' : col.color

  return (
    <div style={{
      flex: 1,
      minWidth: 240,
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {/* Colored status header — label + description + value all inside accent container */}
      <div style={{
        padding: '10px 14px',
        background: isNueva ? 'rgba(255,255,255,0.09)' : `rgba(${rgb},0.1)`,
        border: isNueva ? '1px solid rgba(255,255,255,0.25)' : `1px solid rgba(${rgb},0.4)`,
        borderRadius: 8,
        margin: '10px 10px 0',
        boxShadow: isNueva ? '0 0 8px rgba(255,255,255,0.1)' : `0 0 8px rgba(${rgb},0.2)`,
        minHeight: 80,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            alignSelf: 'baseline',
            position: 'relative',
            top: 1,
          }}>
            <Icon size={13} color={labelColor} strokeWidth={1.5} />
          </div>
          <span style={{
            fontSize: 13,
            fontFamily: "'Satoshi', sans-serif",
            fontWeight: 700,
            color: labelColor,
            letterSpacing: '0.05em',
            flex: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1,
          }}>
            {col.label}
          </span>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            color: labelColor,
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}>
            {cards.length}
          </span>
        </div>
        <p style={{ fontSize: 11, color: `rgba(${rgb},0.7)`, margin: 0, fontFamily: 'DM Sans, sans-serif', marginTop: 7 }}>
          {col.descripcion}
        </p>
      </div>

      {/* Cards — neutral, no color treatment */}
      <div style={{
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        boxSizing: 'border-box',
      }}>
        {cards.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: '#6F7876', fontFamily: 'DM Sans, sans-serif' }}>Sin oportunidades</p>
          </div>
        ) : (
          cards.map(op => <OpportunityCard key={op.id} oportunidad={op} />)
        )}
      </div>
    </div>
  )
}

function ListView({ rows, onSelect }) {
  if (rows.length === 0) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: '#6F7876', fontFamily: 'DM Sans, sans-serif' }}>
          No se encontraron oportunidades.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Header row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1.4fr 1fr 110px 110px 120px',
        gap: 12,
        padding: '8px 16px',
      }}>
        {['Oportunidad', 'Partner', 'Contrato', 'Valor', 'Última actividad', 'Estado'].map(h => (
          <span key={h} style={{ fontSize: 11, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {h}
          </span>
        ))}
      </div>

      {/* Data rows */}
      {rows.map(op => {
        const cfg = ESTADO_CONFIG[op.estado]
        const rgb = hexToRgb(cfg.color)
        return (
          <div
            key={op.id}
            onClick={() => onSelect(op)}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1.4fr 1fr 110px 110px 120px',
              gap: 12,
              padding: '13px 16px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 10,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              alignItems: 'center',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = `rgba(${rgb},0.04)`
              e.currentTarget.style.borderColor = `rgba(${rgb},0.18)`
              e.currentTarget.style.transform = 'translateX(2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.transform = 'translateX(0)'
            }}
          >
            {/* Name + client */}
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#F5F7F7', margin: 0, fontFamily: 'DM Sans, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {op.cliente}
              </p>
              <p style={{ fontSize: 11, color: '#6F7876', margin: '2px 0 0', fontFamily: 'DM Sans, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {op.cliente}
              </p>
            </div>
            {/* Partner */}
            <p style={{ fontSize: 12, color: '#A3AEAC', margin: 0, fontFamily: 'DM Sans, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {op.partner}
            </p>
            {/* Contract */}
            <p style={{ fontSize: 12, color: '#6F7876', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
              {op.tipoContrato}
            </p>
            {/* Value */}
            <p className="font-clash" style={{ fontSize: 14, fontWeight: 700, color: '#F5F7F7', margin: 0, letterSpacing: '-0.01em' }}>
              {formatValor(op.valor)}
            </p>
            {/* Last activity */}
            <p style={{ fontSize: 12, color: '#6F7876', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
              {formatFecha(op.ultimaActividad)}
            </p>
            {/* Status badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, flexShrink: 0, boxShadow: `0 0 6px ${cfg.color}` }} />
              <span style={{ fontSize: 11, color: cfg.color, fontFamily: 'Satoshi, sans-serif', fontWeight: 700, whiteSpace: 'nowrap' }}>
                {cfg.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function HistorialView({ rows, onSelect, onReactivar }) {
  if (rows.length === 0) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: '#6F7876', fontFamily: 'DM Sans, sans-serif' }}>
          Aún no hay oportunidades cerradas.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 110px 110px 90px 100px', gap: 12, padding: '8px 16px' }}>
        {['Oportunidad', 'Partner', 'Valor', 'Fecha de cierre', 'Resultado', ''].map((h, i) => (
          <span key={i} style={{ fontSize: 11, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {h}
          </span>
        ))}
      </div>

      {rows.map(op => {
        const isGanada = op.estado === 'ganada'
        const color    = isGanada ? '#B0FF92' : '#F97316'
        const label    = isGanada ? 'Ganada' : 'Descalificada'
        const rgb      = hexToRgb(color)
        return (
          <div
            key={op.id}
            onClick={() => onSelect(op)}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1.2fr 110px 110px 90px 100px',
              gap: 12,
              padding: '13px 16px',
              background: isGanada ? 'rgba(255,255,255,0.03)' : 'rgba(249,115,22,0.1)',
              border: isGanada ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(249,115,22,0.3)',
              borderRadius: 10,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              alignItems: 'center'
            }}
            onMouseEnter={e => {
              if (!isGanada) {
                e.currentTarget.style.borderColor = 'rgba(249,115,22,0.6)'
                e.currentTarget.style.boxShadow = '0 0 16px rgba(249,115,22,0.2)'
              } else {
                e.currentTarget.style.background = `rgba(${rgb},0.04)`
                e.currentTarget.style.borderColor = `rgba(${rgb},0.15)`
              }
              e.currentTarget.style.transform = 'translateX(2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.transform = 'translateX(0)'
            }}
          >
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#F5F7F7', margin: 0, fontFamily: 'DM Sans, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {op.cliente}
              </p>
              <p style={{ fontSize: 11, color: '#6F7876', margin: '2px 0 0', fontFamily: 'DM Sans, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {op.cliente}
              </p>
            </div>
            <p style={{ fontSize: 12, color: '#A3AEAC', margin: 0, fontFamily: 'DM Sans, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {op.partner}
            </p>
            <p className="font-clash" style={{ fontSize: 14, fontWeight: 700, color: '#F5F7F7', margin: 0, letterSpacing: '-0.01em' }}>
              {formatValor(op.valor)}
            </p>
            <p style={{ fontSize: 12, color: '#6F7876', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
              {formatFecha(op.fechaCierre || op.ultimaActividad)}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 6px ${color}` }} />
              <span style={{ fontSize: 11, color, fontFamily: 'Satoshi, sans-serif', fontWeight: 700, whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={e => { e.stopPropagation(); onReactivar(op) }}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, border: '1px solid transparent', background: 'transparent', color: '#A3AEAC', fontSize: 12, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#F5F7F7'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#A3AEAC'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'transparent' }}
              >
                <RotateCcw size={12} strokeWidth={1.5} />
                Reactivar
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : '255,255,255'
}
