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

  function enviarPulseCheck(id) {
    setOportunidades(prev =>
      prev.map(o => {
        if (o.id !== id) return o
        return {
          ...o,
          ultimaActividad: '2026-06-09',
          pulseChecks: [
            { fecha: '2026-06-09', destinatario: o.partner, estado: 'Enviado' },
            ...o.pulseChecks,
          ],
          timeline: [
            { fecha: '2026-06-09', tipo: 'pulse_check', descripcion: 'Pulse Check enviado manualmente' },
            ...o.timeline,
          ],
        }
      })
    )
  }

  function guardarCompensacion(config) {
    setCompensacion(config)
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

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    const toReactivate = oportunidades.filter(o => o.enEspera && o.enEsperaHasta && o.enEsperaHasta <= today)
    if (toReactivate.length === 0) return

    setOportunidades(prev => prev.map(o => {
      if (!o.enEspera || !o.enEsperaHasta || o.enEsperaHasta > today) return o
      return {
        ...o,
        enEspera: false,
        enEsperaHasta: null,
        enEsperaMotivo: null,
        timeline: [
          { fecha: today, tipo: 'reactivacion', descripcion: 'Oportunidad reactivada automáticamente' },
          ...o.timeline,
        ],
      }
    }))

    setNotificaciones(prev => [
      ...toReactivate.map(o => ({
        id: `n_react_${o.id}`,
        tipo: 'reactivacion',
        titulo: `${o.nombre} se reactivó`,
        descripcion: `La oportunidad con ${o.partner} salió de pausa. Es momento de hacer seguimiento.`,
        fecha: today,
        leida: false,
        prioridad: 'media',
        oportunidadId: o.id,
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
      toggleAutomatico,
      agregarNota,
      enviarPulseCheck,
      cerrarComoGanada,
      cerrarComoPerdida,
      cerrarOportunidad,
      reactivarDesdeHistorial,
      ponerEnEspera,
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
