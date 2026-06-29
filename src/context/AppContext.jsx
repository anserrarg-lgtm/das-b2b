import { createContext, useContext, useState, useEffect } from 'react'
import { oportunidades as initialOps, notificaciones as initialNotifs } from '../data/mockData'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [oportunidades, setOportunidades] = useState(initialOps)
  const [notificaciones, setNotificaciones] = useState(initialNotifs)
  const [selectedOportunidad, setSelectedOportunidad] = useState(null)
  const [compensacion, setCompensacion] = useState(null)

  const unreadCount = notificaciones.filter(n => !n.leida).length

  function marcarLeida(id) {
    setNotificaciones(prev =>
      prev.map(n => n.id === id ? { ...n, leida: true } : n)
    )
  }

  function marcarTodasLeidas() {
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
  }

  function toggleAutomatico(id) {
    setOportunidades(prev =>
      prev.map(o => {
        if (o.id !== id) return o
        const next = !o.automatico
        return {
          ...o,
          automatico: next,
          proximoPulse: next ? '2026-06-16' : null,
        }
      })
    )
  }

  function agregarNota(id, texto) {
    setOportunidades(prev =>
      prev.map(o => {
        if (o.id !== id) return o
        return {
          ...o,
          nota: texto,
          ultimaActividad: '2026-06-09',
          timeline: [
            { fecha: '2026-06-09', tipo: 'nota', descripcion: texto },
            ...o.timeline,
          ],
        }
      })
    )
  }

  function enviarPulseCheck(id, pulseCheck) {
    const today = new Date().toISOString().slice(0, 10)
    setOportunidades(prev =>
      prev.map(o => {
        if (o.id !== id) return o
        const pc = pulseCheck || { fecha: today, destinatario: o.partner, estado: 'Enviado' }
        return {
          ...o,
          ultimaActividad: today,
          pulseChecks: [
            ...o.pulseChecks,
            pc,
          ],
          timeline: [
            { fecha: today, tipo: 'pulse_check', descripcion: 'Pulse Check enviado manualmente' },
            ...o.timeline,
          ],
        }
      })
    )
  }

  function guardarCompensacion(config) {
    setCompensacion(config)
  }

  function marcarComoLeida(id) {
    setOportunidades(prev =>
      prev.map(o => {
        if (o.id !== id) return o
        return { ...o, unread: false }
      })
    )
  }

  function cerrarComoGanada(id) {
    const today = new Date().toISOString().slice(0, 10)
    setOportunidades(prev =>
      prev.map(o => {
        if (o.id !== id) return o
        return {
          ...o,
          previousStatus: o.estado,
          estado: 'ganada',
          fechaCierre: today,
          automatico: false,
          proximoPulse: null,
          timeline: [
            { fecha: today, tipo: 'cierre', descripcion: 'Oportunidad cerrada como Ganada' },
            ...o.timeline,
          ],
        }
      })
    )
  }

  function cerrarComoPerdida(id) {
    const today = new Date().toISOString().slice(0, 10)
    setOportunidades(prev =>
      prev.map(o => {
        if (o.id !== id) return o
        return {
          ...o,
          previousStatus: o.estado,
          estado: 'perdida',
          fechaCierre: today,
          automatico: false,
          proximoPulse: null,
          timeline: [
            { fecha: today, tipo: 'cierre', descripcion: 'Oportunidad descalificada' },
            ...o.timeline,
          ],
        }
      })
    )
  }

  function cerrarOportunidad(id) {
    cerrarComoPerdida(id)
  }

  function reactivarDesdeHistorial(id) {
    const today = new Date().toISOString().slice(0, 10)
    setOportunidades(prev =>
      prev.map(o => {
        if (o.id !== id) return o
        const restoredStatus = o.previousStatus || 'respondida'
        return {
          ...o,
          estado: restoredStatus,
          previousStatus: null,
          fechaCierre: null,
          timeline: [
            { fecha: today, tipo: 'reactivacion', descripcion: `Oportunidad reactivada desde el historial como ${restoredStatus}` },
            ...o.timeline,
          ],
        }
      })
    )
  }

  function ponerEnEspera(id, fechaReactivacion, motivo) {
    const today = new Date().toISOString().slice(0, 10)
    setOportunidades(prev =>
      prev.map(o => {
        if (o.id !== id) return o
        return {
          ...o,
          enEspera: true,
          enEsperaHasta: fechaReactivacion,
          enEsperaMotivo: motivo || null,
          automatico: false,
          timeline: [
            { fecha: today, tipo: 'espera', descripcion: `Puesta en espera hasta ${fechaReactivacion}${motivo ? ': ' + motivo : ''}` },
            ...o.timeline,
          ],
        }
      })
    )
  }

  function cambiarEstado(id, nuevoEstado) {
    const today = new Date().toISOString().slice(0, 10)
    setOportunidades(prev =>
      prev.map(o => {
        if (o.id !== id) return o
        return {
          ...o,
          estado: nuevoEstado,
          ultimaActividad: today,
          timeline: [
            { fecha: today, tipo: 'cambio_estado', descripcion: `Estado cambiado a ${nuevoEstado}` },
            ...o.timeline,
          ],
        }
      })
    )
  }

  function salirDeEspera(id) {
    const today = new Date().toISOString().slice(0, 10)
    const op = oportunidades.find(o => o.id === id)
    if (!op) return

    const restoredStatus = op.previousStatus || 'esperando'

    setOportunidades(prev =>
      prev.map(o => {
        if (o.id !== id) return o
        return {
          ...o,
          enEspera: false,
          enEsperaHasta: null,
          enEsperaMotivo: null,
          estado: restoredStatus,
          previousStatus: null,
          timeline: [
            { fecha: today, tipo: 'reactivacion', descripcion: `Sacada de espera y reactivada como ${restoredStatus}` },
            ...o.timeline,
          ],
        }
      })
    )

    setNotificaciones(prev => [
      {
        id: Date.now(),
        tipo: 'reactivada',
        titulo: 'Oportunidad reactivada',
        descripcion: `La oportunidad ${op.nombre} con ${op.partner} salió del período de espera. Se envió un Pulse Check automático al partner.`,
        oportunidadId: op.id,
        fecha: new Date().toISOString().slice(0, 10),
        leida: false,
      },
      ...prev
    ])
  }

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    const toReactivate = oportunidades.filter(o => o.enEspera && o.enEsperaHasta && o.enEsperaHasta <= today)
    if (toReactivate.length === 0) return

    setOportunidades(prev => prev.map(o => {
      if (!o.enEspera || !o.enEsperaHasta || o.enEsperaHasta > today) return o
      const restoredStatus = o.previousStatus || 'esperando'
      return {
        ...o,
        enEspera: false,
        enEsperaHasta: null,
        enEsperaMotivo: null,
        estado: restoredStatus,
        previousStatus: null,
        timeline: [
          { fecha: today, tipo: 'reactivacion', descripcion: `Oportunidad reactivada automáticamente como ${restoredStatus}` },
          ...o.timeline,
        ],
      }
    }))

    setNotificaciones(prev => [
      ...toReactivate.map(o => ({
        id: Date.now() + Math.random(),
        tipo: 'reactivada',
        titulo: 'Oportunidad reactivada',
        descripcion: `La oportunidad ${o.nombre} con ${o.partner} salió del período de espera. Se envió un Pulse Check automático al partner.`,
        oportunidadId: o.id,
        fecha: today,
        leida: false,
      })),
      ...prev,
    ])
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AppContext.Provider value={{
      oportunidades,
      notificaciones,
      selectedOportunidad,
      setSelectedOportunidad,
      unreadCount,
      marcarLeida,
      marcarTodasLeidas,
      marcarComoLeida,
      toggleAutomatico,
      agregarNota,
      enviarPulseCheck,
      cambiarEstado,
      cerrarComoGanada,
      cerrarComoPerdida,
      cerrarOportunidad,
      reactivarDesdeHistorial,
      ponerEnEspera,
      salirDeEspera,
      compensacion,
      guardarCompensacion,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
