import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Activity, Clock, AlertCircle, CheckCircle, Search, LayoutGrid, List, Upload, Download, TrendingUp, RotateCcw, Plus, Inbox } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { ESTADOS, ESTADO_CONFIG } from '../../data/mockData'
import OpportunityCard from './OpportunityCard'
import { useNavigate, useLocation } from 'react-router-dom'

const COLUMNS = [
  { id: ESTADOS.NUEVA,           ...ESTADO_CONFIG[ESTADOS.NUEVA],           descripcion: 'Nuevas oportunidades',             icon: Plus        },
  { id: ESTADOS.RESPONDIDA,      ...ESTADO_CONFIG[ESTADOS.RESPONDIDA],      descripcion: 'Partner respondió recientemente', icon: Activity    },
  { id: ESTADOS.ESPERANDO,       ...ESTADO_CONFIG[ESTADOS.ESPERANDO],       descripcion: 'Pulse Check enviado',              icon: Clock       },
  { id: ESTADOS.SIN_RESPUESTA,   ...ESTADO_CONFIG[ESTADOS.SIN_RESPUESTA],   descripcion: 'Sin actividad en 10+ días',       icon: AlertCircle },
  { id: ESTADOS.VENTA_CONFIRMADA,...ESTADO_CONFIG[ESTADOS.VENTA_CONFIRMADA],descripcion: 'Venta cerrada por el partner',    icon: CheckCircle },
]

const ACTIVE_STATES = [ESTADOS.NUEVA, ESTADOS.RESPONDIDA, ESTADOS.ESPERANDO, ESTADOS.SIN_RESPUESTA, ESTADOS.VENTA_CONFIRMADA]

const FILTER_OPTIONS = [
  { value: 'todas',                    label: 'Todas'              },
  { value: ESTADOS.NUEVA,              label: 'Nueva'              },
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
  const { oportunidades, setSelectedOportunidad, compensacion, reactivarDesdeHistorial } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeFilter, setActiveFilter] = useState('todas')
  const [searchQuery, setSearchQuery] = useState(location.state?.partnerFilter || '')
  const [viewMode, setViewMode] = useState('board') // 'board' | 'list'
  const [confirmReactivar, setConfirmReactivar] = useState(null)
  const [toastMsg, setToastMsg] = useState(null)

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

  const visibleColumns = (activeFilter === 'todas' || isHistorial || activeFilter === 'en_espera')
    ? COLUMNS
    : COLUMNS.filter(c => c.id === activeFilter)

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
        <p style={{ padding: '0 40px', margin: '0 0 8px', textAlign: 'right', fontSize: 12, color: '#6F7876', fontFamily: 'DM Sans, sans-serif' }}>
          {isHistorial ? `${historialRows.length} en historial` : activeFilter === 'en_espera' ? `${enEsperaCount} en espera` : `${activeCount} oportunidades activas`}
        </p>

        {/* Board view */}
        {!isHistorial && viewMode === 'board' && (
          <div style={{
            padding: '0 40px 48px',
            display: 'flex',
            gap: 14,
            alignItems: 'flex-start',
            overflowX: 'auto',
          }}>
            {visibleColumns.map(col => {
              const cards = byEstado[col.id].filter(matchesSearch)
              return <Column key={col.id} col={col} cards={cards} />
            })}
          </div>
        )}

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
              <span style={{ color: '#A3AEAC', fontWeight: 500 }}>{confirmReactivar.nombre}</span>
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

  return (
    <div style={{
      flex: '1 1 0',
      minWidth: 220,
      maxWidth: 280,
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
        background: `rgba(${rgb},0.1)`,
        border: `1px solid rgba(${rgb},0.4)`,
        borderRadius: 8,
        margin: '10px 10px 0',
        boxShadow: `0 0 8px rgba(${rgb},0.2)`,
        minHeight: 80,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Icon size={13} color={col.color} strokeWidth={1.5} />
          <span className="font-clash" style={{
            fontSize: 14, color: col.color,
            letterSpacing: '0.05em', flex: 1,
          }}>
            {col.label}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 700, color: col.color,
          }}>
            {cards.length}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 7 }}>
          <p style={{ fontSize: 11, color: `rgba(${rgb},0.7)`, margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
            {col.descripcion}
          </p>
          {cards.length > 0 && (
            <p style={{ fontSize: 11, margin: 0, fontFamily: 'Satoshi, sans-serif', fontWeight: 600, color: `rgba(${rgb},0.65)` }}>
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(totalValue)}
            </p>
          )}
        </div>
      </div>

      {/* Cards — neutral, no color treatment */}
      <div style={{
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
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
                {op.nombre}
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
        const color    = isGanada ? '#B0FF92' : '#FF6B6B'
        const label    = isGanada ? 'Ganada' : 'Descalificada'
        const rgb      = hexToRgb(color)
        return (
          <div
            key={op.id}
            onClick={() => onSelect(op)}
            style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 110px 110px 90px 100px', gap: 12, padding: '13px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s ease', alignItems: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.background = `rgba(${rgb},0.04)`; e.currentTarget.style.borderColor = `rgba(${rgb},0.15)`; e.currentTarget.style.transform = 'translateX(2px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateX(0)' }}
          >
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#F5F7F7', margin: 0, fontFamily: 'DM Sans, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {op.nombre}
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
