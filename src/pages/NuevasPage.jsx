import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Sparkles, Clock } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useApp } from '../context/AppContext'
import { ESTADOS } from '../data/mockData'
import { useState } from 'react'

const formatValor = (valor) => {
  if (!valor) return '$0'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(valor)
}

export default function NuevasPage() {
  const navigate = useNavigate()
  const { oportunidades, setSelectedOportunidad, enviarPulseCheck, cambiarEstado } = useApp()
  const [showBulkPulseModal, setShowBulkPulseModal] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  const nuevas = oportunidades.filter(op => op.estado === ESTADOS.NUEVA)
  console.log('nuevas:', nuevas.length, 'total:', oportunidades.length)

  const getContractBadgeColor = (status) => {
    const colors = {
      [ESTADOS.NUEVA]: { bg: 'rgba(255,255,255,0.15)', color: '#C8CDD0' },
      [ESTADOS.SIN_RESPUESTA]: { bg: 'rgba(249,115,22,0.15)', color: '#F97316' },
      [ESTADOS.ESPERANDO]: { bg: 'rgba(123,88,248,0.15)', color: '#7B58F8' },
      [ESTADOS.RESPONDIDA]: { bg: 'rgba(176,255,146,0.15)', color: '#B0FF92' },
      [ESTADOS.VENTA_CONFIRMADA]: { bg: 'rgba(95,191,249,0.15)', color: '#5FBFF9' },
    }
    return colors[status] || colors[ESTADOS.NUEVA]
  }

  const handleRowClick = (op) => {
    setSelectedOportunidad(op)
    navigate(`/oportunidad/${op.id}`, { state: { from: 'nuevas' } })
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr + 'T00:00:00')
    const day = date.getDate()
    const month = date.toLocaleDateString('es-CO', { month: 'short' })
    return `${day} de ${month}`
  }

  return (
    <div style={{ minHeight: '100vh', background: '#171D1C', color: '#F5F7F7' }}>
      {/* Header */}
      <div style={{ padding: '40px' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            color: '#A3AEAC',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 14,
            fontFamily: 'DM Sans, sans-serif',
            marginBottom: 24,
            padding: 0,
          }}
        >
          <ChevronLeft size={16} />
          Pipeline
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h1 style={{
            fontSize: 48,
            fontWeight: 300,
            fontFamily: "'Satoshi', sans-serif",
            margin: 0,
            color: '#F5F7F7',
          }}>
            Recién cargadas
          </h1>
          <button
            onClick={() => setShowBulkPulseModal(true)}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#A3AEAC',
              borderRadius: '8px',
              padding: '10px 18px',
              fontFamily: 'DM Sans',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Enviar Pulse Check a todas
          </button>
        </div>

        <p style={{
          fontSize: 14,
          fontFamily: 'DM Sans, sans-serif',
          color: '#A3AEAC',
          margin: '0 0 24px',
        }}>
          Oportunidades sin acción asignada
        </p>

        <div style={{
          height: '1px',
          background: 'rgba(255,255,255,0.06)',
          marginBottom: 32,
        }} />
      </div>

      {/* List */}
      <div style={{ padding: '0 40px 48px' }}>
        {nuevas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#6F7876' }}>
            <p style={{ fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>
              No hay oportunidades recién cargadas
            </p>
          </div>
        ) : (
          <div>
            {nuevas.map(op => {
              const badgeColor = getContractBadgeColor(op.estado)
              return (
                <div
                  key={op.id}
                  onClick={() => handleRowClick(op)}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 12,
                    padding: '20px 24px',
                    marginBottom: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 24,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(176,255,146,0.3)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  }}
                >
                  {/* Left: Name and Partner */}
                  <div style={{ flex: 2 }}>
                    <p style={{
                      fontSize: 15,
                      fontWeight: 700,
                      fontFamily: "'Satoshi', sans-serif",
                      color: '#F5F7F7',
                      margin: '0 0 6px',
                    }}>
                      {op.cliente}
                    </p>
                    <p style={{
                      fontSize: 14,
                      fontFamily: 'DM Sans, sans-serif',
                      color: '#A3AEAC',
                      margin: 0,
                    }}>
                      {op.partner}
                    </p>
                  </div>

                  {/* Contract Type */}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'DM Sans', fontSize: '14px', color: '#A3AEAC', margin: 0 }}>
                      {op.tipoContrato}
                    </p>
                  </div>

                  {/* Producto y Cantidad */}
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontFamily: 'DM Sans',
                      fontSize: '14px',
                      color: '#A3AEAC',
                      margin: '0 0 2px'
                    }}>
                      {op.producto}
                    </p>
                    <p style={{
                      fontFamily: 'DM Sans',
                      fontSize: '14px',
                      color: '#A3AEAC',
                      margin: 0
                    }}>
                      {op.cantidad}
                    </p>
                  </div>

                  {/* Value */}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'DM Sans', fontSize: '14px', fontWeight: 700, color: '#F5F7F7', margin: 0 }}>
                      {formatValor(op.valor)}
                    </p>
                  </div>

                  {/* Center: Date */}
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: 14,
                      fontFamily: 'DM Sans, sans-serif',
                      color: '#A3AEAC',
                      margin: 0,
                    }}>
                      {formatDate(op.fechaCreacion || op.ultimaActividad)}
                    </p>
                  </div>

                  {/* Right: Button */}
                  <div style={{ marginLeft: 'auto' }}>
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        handleRowClick(op)
                      }}
                      style={{
                        background: 'rgba(176,255,146,0.08)',
                        border: '1px solid rgba(176,255,146,0.15)',
                        color: '#B0FF92',
                        fontSize: 13,
                        padding: '7px 14px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontFamily: 'DM Sans, sans-serif',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'rgba(176,255,146,0.3)'
                        e.currentTarget.style.color = '#B0FF92'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                        e.currentTarget.style.color = '#A3AEAC'
                      }}
                    >
                      Ver oportunidad
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bulk Pulse Check Modal */}
      {showBulkPulseModal && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0,
          width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.75)',
          zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
        onClick={() => setShowBulkPulseModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '480px',
              background: 'rgba(18,23,22,0.97)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '28px',
              backdropFilter: 'blur(24px)'
            }}
          >
            <p style={{fontFamily: 'Satoshi', fontWeight: 700, fontSize: '18px', color: '#F5F7F7', margin: '0 0 8px'}}>
              Enviar Pulse Check a todas
            </p>
            <p style={{fontFamily: 'DM Sans', fontSize: '13px', color: '#6F7876', margin: '0 0 20px'}}>
              Se enviará este mensaje a los {nuevas.length} partners de las oportunidades recién cargadas:
            </p>
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '8px',
              padding: '14px 16px',
              marginBottom: '20px'
            }}>
              <p style={{fontFamily: 'DM Sans', fontSize: '13px', color: '#A3AEAC', margin: 0, lineHeight: 1.6}}>
                "Hola [nombre], te contactamos para hacer seguimiento sobre [cliente]. ¿Puedes confirmarnos el estado actual de esta oportunidad?"
              </p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              background: 'rgba(176,255,146,0.05)',
              border: '1px solid rgba(176,255,146,0.1)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '20px'
            }}>
              <Sparkles size={14} style={{color: '#B0FF92', marginTop: '2px', flexShrink: 0}}/>
              <p style={{
                margin: 0,
                fontFamily: 'DM Sans',
                fontSize: '12px',
                color: '#6F7876',
                lineHeight: 1.5
              }}>
                En producción este mensaje será generado por IA según el contexto de cada oportunidad
              </p>
            </div>
            <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
              <button
                onClick={() => setShowBulkPulseModal(false)}
                style={{padding: '8px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#A3AEAC', cursor: 'pointer', fontFamily: 'DM Sans'}}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  nuevas.forEach(op => {
                    const pulseCheck = {
                      id: `bulk_${op.id}_${Date.now()}`,
                      date: new Date().toISOString().slice(0,10),
                      type: 'auto',
                      sentBy: 'Carlos',
                      message: `Hola, te contactamos para hacer seguimiento sobre ${op.cliente}. ¿Puedes confirmarnos el estado actual de esta oportunidad?`,
                      status: 'enviado'
                    }
                    enviarPulseCheck(op.id, pulseCheck)
                    cambiarEstado(op.id, 'esperando')
                  })
                  setToastMessage('Pulse Checks enviados. Las oportunidades están ahora en Esperando respuesta.')
                  setTimeout(() => setToastMessage(null), 4000)
                  setShowBulkPulseModal(false)
                }}
                style={{padding: '8px 16px', background: '#B0FF92', border: 'none', borderRadius: '8px', color: '#121716', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 500}}
              >
                Confirmar y enviar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Toast Notification */}
      {toastMessage && createPortal(
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          background: 'rgba(123,88,248,0.15)',
          border: '1px solid rgba(123,88,248,0.3)',
          borderRadius: '8px',
          padding: '14px 16px',
          maxWidth: '400px',
          zIndex: 100000,
          animation: 'slideIn 0.3s ease-out'
        }}>
          <Clock size={16} style={{color: '#7B58F8', marginTop: '2px', flexShrink: 0}}/>
          <p style={{
            margin: 0,
            fontFamily: 'DM Sans',
            fontSize: '14px',
            color: '#7B58F8',
            lineHeight: 1.5
          }}>
            {toastMessage}
          </p>
        </div>,
        document.body
      )}
    </div>
  )
}
