import { useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const ACTIVE_STATES    = ['sin_respuesta', 'esperando', 'respondida', 'venta_confirmada']
const RESPONDED_STATES = ['respondida', 'venta_confirmada', 'ganada']

function computePartners(oportunidades) {
  const map = {}
  oportunidades.forEach(op => {
    if (!map[op.partner]) map[op.partner] = []
    map[op.partner].push(op)
  })

  return Object.entries(map).map(([name, ops]) => {
    const activeOps    = ops.filter(o => ACTIVE_STATES.includes(o.estado)).length
    const sinRespuesta = ops.filter(o => o.estado === 'sin_respuesta').length
    const responded    = ops.filter(o => RESPONDED_STATES.includes(o.estado)).length
    const total        = ops.length
    const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0

    const latestDate = ops.reduce((latest, op) => {
      const d = new Date(op.ultimaActividad + 'T00:00:00')
      return d > latest ? d : latest
    }, new Date('2000-01-01'))
    const daysSince = Math.max(0, Math.floor((Date.now() - latestDate.getTime()) / 86400000))

    return { name, activeOps, sinRespuesta, responseRate, daysSince }
  }).sort((a, b) => a.responseRate - b.responseRate)
}

function rateColor(rate) {
  if (rate >= 70) return '#B0FF92'
  if (rate >= 40) return '#F5B942'
  return '#F97316'
}

export default function PartnersPage() {
  const { oportunidades } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const partnerFilter = location.state?.partnerFilter

  const allPartners = useMemo(() => computePartners(oportunidades), [oportunidades])
  const partners = partnerFilter
    ? allPartners.filter(p => p.name === partnerFilter)
    : allPartners

  return (
    <div style={{ padding: '88px 40px 64px' }}>

      {/* Header */}
      <h1 style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 300, fontSize: 48, color: '#F5F7F7', margin: '0 0 8px', letterSpacing: '-0.03em', lineHeight: 1 }}>
        Partners
      </h1>
      <p style={{ fontSize: 14, color: '#A3AEAC', margin: '0 0 24px', fontFamily: 'DM Sans, sans-serif' }}>
        Rendimiento de tu red de distribución
      </p>
      <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)', marginBottom: 32 }} />

      {/* Active filter indicator */}
      {partnerFilter && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: '#A3AEAC', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
            Mostrando: <span style={{ color: '#F5F7F7', fontWeight: 600 }}>{partnerFilter}</span>
          </p>
          <button
            onClick={() => navigate('/partners', { replace: true })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#B0FF92', fontSize: 12, fontFamily: 'DM Sans, sans-serif' }}
          >
            Ver todos
          </button>
        </div>
      )}

      {/* Partner list */}
      {partners.length === 0 ? (
        <div style={{ padding: '64px 0', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', margin: '0 0 4px' }}>
            Aún no tienes partners registrados.
          </p>
          <p style={{ fontSize: 13, color: '#4A5452', fontFamily: 'DM Sans, sans-serif', margin: 0 }}>
            Importa oportunidades para comenzar.
          </p>
        </div>
      ) : (
        <div>
          {partners.map(partner => (
            <PartnerRow
              key={partner.name}
              partner={partner}
              onVerOportunidades={() => navigate('/', { state: { partnerFilter: partner.name } })}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function MetricPill({ label, value, color }) {
  return (
    <div style={{ minWidth: 80 }}>
      <p className="font-clash" style={{ fontSize: 20, fontWeight: 700, color: color || '#F5F7F7', margin: '0 0 3px', lineHeight: 1 }}>
        {value}
      </p>
      <p style={{ fontSize: 10, color: '#6F7876', margin: 0, fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500, whiteSpace: 'nowrap' }}>
        {label}
      </p>
    </div>
  )
}

function PartnerRow({ partner, onVerOportunidades }) {
  return (
    <div
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 24, transition: 'all 0.2s ease' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(176,255,146,0.3)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(176,255,146,0.08)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = 'none' }}
    >
      {/* Left — name + last activity */}
      <div style={{ minWidth: 190, flexShrink: 0 }}>
        <p className="font-clash" style={{ fontSize: 15, fontWeight: 700, color: '#F5F7F7', margin: '0 0 4px' }}>
          {partner.name}
        </p>
        <p style={{ fontSize: 12, color: '#6F7876', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
          Última actividad: hace {partner.daysSince} día{partner.daysSince !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Middle — 3 metrics */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        <MetricPill label="Ops" value={partner.activeOps} />
        <MetricPill
          label="Sin respuesta"
          value={partner.sinRespuesta}
          color={partner.sinRespuesta >= 2 ? '#F97316' : '#F5F7F7'}
        />
        <MetricPill
          label="Tasa de respuesta"
          value={`${partner.responseRate}%`}
          color={rateColor(partner.responseRate)}
        />
      </div>

      {/* Right — action */}
      <button
        onClick={e => { e.stopPropagation(); onVerOportunidades() }}
        style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(176,255,146,0.08)', border: '1px solid rgba(176,255,146,0.15)', color: '#B0FF92', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s', whiteSpace: 'nowrap', flexShrink: 0 }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(176,255,146,0.14)'; e.currentTarget.style.borderColor = 'rgba(176,255,146,0.3)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(176,255,146,0.08)'; e.currentTarget.style.borderColor = 'rgba(176,255,146,0.15)' }}
      >
        Ver oportunidades
      </button>
    </div>
  )
}
