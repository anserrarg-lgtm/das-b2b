import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { ChevronRight, ArrowDown } from 'lucide-react'
import { oportunidades as mockOps } from '../data/mockData'
import captureHero from '../assets/capture-hero.png'
import capturePipeline from '../assets/capture-pipeline.png'
import capturePartners from '../assets/capture-partners.png'
import captureNotifications from '../assets/capture-notifications.png'
import captureDetail from '../assets/capture-detail.png'

function BeaconLogo() {
  return (
    <div style={{
      width: 28,
      height: 28,
      borderRadius: '50%',
      background: 'transparent',
      flexShrink: 0,
      boxShadow: [
        '0 0 0 1px rgba(176, 255, 146, 0.9)',
        '0 0 8px 4px rgba(176, 255, 146, 0.5)',
        '0 0 20px 8px rgba(176, 255, 146, 0.2)',
        '0 0 40px 16px rgba(176, 255, 146, 0.08)',
      ].join(', '),
    }} />
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)
  // 2026-10-19, a pedido de Ana: el carrusel de "Una op. Tres estados..."
  // arrancaba apenas cargaba la página entera, no cuando se llegaba
  // scrolleando a esa sección -- para cuando el usuario de verdad bajaba
  // hasta ahí, el auto-avance (cada 3s) ya lo había dejado en el paso 3
  // (venta_confirmada). Ahora el auto-avance queda en pausa hasta que la
  // sección entra al viewport (ver IntersectionObserver más abajo).
  const [hasEnteredSlider, setHasEnteredSlider] = useState(false)
  const sliderSectionRef = useRef(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [animStep, setAnimStep] = useState(0)
  const [animBlur, setAnimBlur] = useState(false)

  // 2026-10-19, a pedido de Ana: las 3 métricas ("13.3 hrs", "3 de 10",
  // "100%") cuentan hacia arriba desde 0 hasta su valor real, una por una
  // (primero la de la izquierda, cuando termina arranca la del medio, y
  // así), en vez de aparecer ya escritas. Arranca cuando la sección de
  // métricas entra bien a la pantalla (ver IntersectionObserver abajo), no
  // apenas carga la página.
  const [metricsStarted, setMetricsStarted] = useState(false)
  const [metricValues, setMetricValues] = useState([0, 0, 0])
  const metricsSectionRef = useRef(null)

  const steps = [
    {
      estado: 'esperando',
      label: 'Esperando respuesta',
      color: '#7B58F8',
      description: 'Beacon envía automáticamente un Pulse Check al partner y monitorea la respuesta.',
      cliente: 'Meridian Corp',
      partner: 'CloudBridge Partners',
      producto: 'Nexus AI Assistant',
      cantidad: '45 licencias',
      valor: '$94,000',
      contrato: 'Anual',
      badge: 'Pulse enviado: 22 de jun',
      resumen: 'Pulse Check enviado. Esperando respuesta del partner sobre el deal.'
    },
    {
      estado: 'respondida',
      label: 'Respondida',
      color: '#B0FF92',
      description: 'El partner respondió. Beacon registra la respuesta y alerta al CAM para tomar acción.',
      cliente: 'Meridian Corp',
      partner: 'CloudBridge Partners',
      producto: 'Nexus AI Assistant',
      cantidad: '45 licencias',
      valor: '$94,000',
      contrato: 'Anual',
      badge: 'Respondida: 24 de jun',
      resumen: 'Partner confirmó avances. El cliente está evaluando la propuesta final.'
    },
    {
      estado: 'venta_confirmada',
      label: 'Venta confirmada',
      color: '#5FBFF9',
      description: 'Deal cerrado. Beacon registra la atribución automáticamente para proteger el bono del CAM.',
      cliente: 'Meridian Corp',
      partner: 'CloudBridge Partners',
      producto: 'Nexus AI Assistant',
      cantidad: '45 licencias',
      valor: '$94,000',
      contrato: 'Anual',
      badge: 'Vence en 45 días',
      resumen: 'Venta confirmada. Contrato firmado y atribución registrada en Beacon.'
    }
  ]

  useEffect(() => {
    const el = sliderSectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEnteredSlider(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // 2026-10-19, a pedido de Ana: threshold más alto (0.35) que el del slider
  // de arriba (0.2) -- quiere que el contador arranque cuando la sección de
  // métricas ya "entró bien" a la pantalla (el título "Basado en usuarios
  // beta" ya bien posicionado arriba), no apenas se asoma un pixel.
  useEffect(() => {
    const el = metricsSectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMetricsStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.35 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // 2026-10-19, a pedido de Ana: las 3 métricas cuentan juntas, al mismo
  // tiempo (no una después de la otra) -- ~1.2s cada una, con un ease-out
  // para que desaceleren al llegar al número final en vez de parar en seco.
  useEffect(() => {
    if (!metricsStarted) return
    const targets = [13.3, 3, 100]
    const duration = 1200
    let cancelled = false
    const rafIds = []

    targets.forEach((target, index) => {
      const startTime = performance.now()
      function tick(now) {
        if (cancelled) return
        const progress = Math.min((now - startTime) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setMetricValues(prev => {
          const next = [...prev]
          next[index] = target * eased
          return next
        })
        if (progress < 1) {
          rafIds[index] = requestAnimationFrame(tick)
        }
      }
      rafIds[index] = requestAnimationFrame(tick)
    })

    return () => {
      cancelled = true
      rafIds.forEach(id => id && cancelAnimationFrame(id))
    }
  }, [metricsStarted])

  useEffect(() => {
    if (!autoPlay || !hasEnteredSlider) return
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev === steps.length - 1) {
          setAutoPlay(false)
          return prev
        }
        const newStep = prev + 1
        setIsTransitioning(true)
        setTimeout(() => {
          setCurrentStep(newStep)
          setIsTransitioning(false)
        }, 300)
        return newStep
      })
    }, 3000)
    return () => clearInterval(timer)
  }, [autoPlay, hasEnteredSlider])

  useEffect(() => {
    const sequence = [
      { action: () => { setAnimStep(0); setAnimBlur(false) }, duration: 3500 },
      { action: () => setAnimBlur(true), duration: 600 },
      { action: () => { setAnimStep(1); setAnimBlur(false) }, duration: 3500 },
      { action: () => setAnimBlur(true), duration: 600 },
      { action: () => { setAnimStep(2); setAnimBlur(false) }, duration: 3500 },
      { action: () => setAnimBlur(true), duration: 600 },
      { action: () => { setAnimStep(3); setAnimBlur(false) }, duration: 3500 },
      { action: () => setAnimBlur(true), duration: 600 },
    ]
    let i = 0
    const runNext = () => {
      if (i >= sequence.length) i = 0
      sequence[i].action()
      const duration = sequence[i].duration
      i++
      setTimeout(runNext, duration)
    }
    const timeout = setTimeout(runNext, 0)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes floatIn {
        0% {
          opacity: 0;
          transform: perspective(1000px) rotateX(15deg) rotateY(-10deg) translateY(30px) scale(0.9);
          filter: blur(8px);
        }
        100% {
          opacity: 1;
          transform: perspective(1000px) rotateX(2deg) rotateY(-3deg) translateY(0) scale(1);
          filter: blur(0);
        }
      }
      @keyframes floating {
        0%, 100% { transform: perspective(1000px) rotateX(2deg) rotateY(-3deg) translateY(0px) }
        50% { transform: perspective(1000px) rotateX(2deg) rotateY(-3deg) translateY(-8px) }
      }
      @keyframes bounceIn {
        0% { opacity: 0; transform: perspective(1000px) rotateX(15deg) scale(0.8) translateY(40px); filter: blur(8px) }
        60% { transform: perspective(1000px) rotateX(-2deg) scale(1.04) translateY(-6px) }
        100% { opacity: 1; transform: perspective(1000px) rotateX(2deg) rotateY(-3deg) scale(1) translateY(0); filter: blur(0) }
      }
      @keyframes exitBlur {
        0% { opacity: 1; filter: blur(0); transform: perspective(1000px) rotateX(2deg) rotateY(-3deg) scale(1) }
        100% { opacity: 0; filter: blur(12px); transform: perspective(1000px) rotateX(15deg) scale(0.9) translateY(-20px) }
      }
      @keyframes fadeIn {
        0% { opacity: 0; transform: translateY(8px) }
        100% { opacity: 1; transform: translateY(0) }
      }
      @keyframes bounceArrow {
        0%, 100% { transform: translateY(0px) }
        50% { transform: translateY(10px) }
      }
      @keyframes aurora1 {
        0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4 }
        33% { transform: translate(-80px, -60px) scale(1.1); opacity: 0.6 }
        66% { transform: translate(40px, -30px) scale(0.95); opacity: 0.3 }
      }
      @keyframes aurora2 {
        0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3 }
        33% { transform: translate(60px, 40px) scale(1.05); opacity: 0.5 }
        66% { transform: translate(-40px, 60px) scale(1.1); opacity: 0.2 }
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  const goToStep = (newStep) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentStep(newStep)
      setIsTransitioning(false)
    }, 300)
  }

  return (
    <div style={{ background: '#121716', minHeight: '100vh', color: '#F5F7F7', fontFamily: 'DM Sans, sans-serif' }}>
      {/* TOP BAR */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '20px 80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 100,
        background: 'rgba(18,23,22,0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BeaconLogo />
          <span style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700, fontSize: 20, color: '#F5F7F7', letterSpacing: '0.02em' }}>
            Beacon
          </span>
        </div>
        <button
          onClick={() => navigate('/pipeline')}
          style={{
            background: '#B0FF92',
            color: '#121716',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            fontFamily: 'DM Sans',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          Ver demo
        </button>
      </div>

      {/* HERO SECTION */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        textAlign: 'left',
        paddingLeft: '80px',
        paddingRight: '80px',
        paddingTop: '80px'
      }}>
        <svg style={{position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0}} viewBox="0 0 1440 900" preserveAspectRatio="none">
          <defs>
            <linearGradient id="fillAurora1" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(100,220,80,0)" />
              <stop offset="40%" stopColor="rgba(100,220,80,0.85)" />
              <stop offset="100%" stopColor="rgba(100,220,80,0)" />
            </linearGradient>
            <linearGradient id="fillAurora2" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(123,88,248,0)" />
              <stop offset="40%" stopColor="rgba(123,88,248,0.8)" />
              <stop offset="100%" stopColor="rgba(123,88,248,0)" />
            </linearGradient>
            <linearGradient id="fillAurora3" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(100,220,80,0)" />
              <stop offset="50%" stopColor="rgba(100,220,80,0.7)" />
              <stop offset="100%" stopColor="rgba(100,220,80,0)" />
            </linearGradient>
            <filter id="softBlur">
              <feGaussianBlur stdDeviation="6"/>
            </filter>
            <filter id="softBlur2">
              <feGaussianBlur stdDeviation="12"/>
            </filter>
            <style>{`
              @keyframes floatBand1 {
                0%, 100% { transform: translateY(0px) scaleX(1); opacity: 0.8 }
                33% { transform: translateY(-25px) scaleX(1.05); opacity: 1 }
                66% { transform: translateY(-10px) scaleX(0.97); opacity: 0.6 }
              }
              @keyframes floatBand2 {
                0%, 100% { transform: translateY(0px) scaleX(1); opacity: 0.7 }
                33% { transform: translateY(-15px) scaleX(0.95); opacity: 0.5 }
                66% { transform: translateY(-30px) scaleX(1.03); opacity: 0.9 }
              }
              @keyframes floatBand3 {
                0%, 100% { transform: translateY(0px) scaleX(1); opacity: 0.6 }
                50% { transform: translateY(-35px) scaleX(1.08); opacity: 1 }
              }
            `}</style>
          </defs>

          <path
            d="M 1440 900 C 1100 850 900 400 600 350 C 300 300 100 100 0 0 C 100 150 300 400 600 450 C 900 500 1100 950 1440 950 Z"
            fill="url(#fillAurora1)"
            opacity="0.3"
            filter="url(#softBlur2)"
            style={{animation:'floatBand1 8s ease-in-out infinite', transformOrigin:'center'}}
          />
          <path
            d="M 1440 900 C 1150 880 950 450 650 400 C 350 350 150 150 0 50 C 150 200 350 450 650 500 C 950 550 1150 950 1440 980 Z"
            fill="url(#fillAurora2)"
            opacity="0.3"
            filter="url(#softBlur2)"
            style={{animation:'floatBand2 10s ease-in-out infinite', transformOrigin:'center'}}
          />
          <path
            d="M 1440 900 C 1050 820 850 380 550 320 C 250 260 50 80 0 -30 C 50 120 250 360 550 420 C 850 480 1050 940 1440 930 Z"
            fill="url(#fillAurora3)"
            opacity="0.3"
            filter="url(#softBlur2)"
            style={{animation:'floatBand3 12s ease-in-out infinite', transformOrigin:'center'}}
          />

          <path
            d="M 1440 900 C 1100 850 900 400 600 350 C 300 300 100 100 0 0 C 100 150 300 400 600 450 C 900 500 1100 950 1440 950 Z"
            fill="url(#fillAurora1)"
            filter="url(#softBlur)"
            style={{animation:'floatBand1 8s ease-in-out infinite', transformOrigin:'center'}}
          />
          <path
            d="M 1440 900 C 1150 880 950 450 650 400 C 350 350 150 150 0 50 C 150 200 350 450 650 500 C 950 550 1150 950 1440 980 Z"
            fill="url(#fillAurora2)"
            filter="url(#softBlur)"
            style={{animation:'floatBand2 10s ease-in-out infinite', transformOrigin:'center'}}
          />
          <path
            d="M 1440 900 C 1050 820 850 380 550 320 C 250 260 50 80 0 -30 C 50 120 250 360 550 420 C 850 480 1050 940 1440 930 Z"
            fill="url(#fillAurora3)"
            filter="url(#softBlur)"
            style={{animation:'floatBand3 12s ease-in-out infinite', transformOrigin:'center'}}
          />
        </svg>

        <div style={{position:'relative', zIndex:1}}>
        <h1 style={{
          fontFamily: "'Satoshi', sans-serif",
          fontWeight: 300,
          fontSize: '72px',
          color: '#F5F7F7',
          margin: '0 0 24px',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          maxWidth: '700px',
          textShadow: '0 0 40px rgba(176,255,146,0.3), 0 0 80px rgba(176,255,146,0.15), 0 0 120px rgba(176,255,146,0.08)'
        }}>
          Sin ops en la oscuridad.
        </h1>

        {/* 2026-10-19, a pedido de Ana: la jerarquía estaba invertida -- el
          * párrafo de abajo (la frase de apoyo "Menos seguimiento manual...")
          * se veía más grande (20px) y el de arriba, que es la descripción
          * principal justo bajo el H1, más chico (18px) y más apagado
          * (#A3AEAC). Ahora el de arriba es el más grande y el más claro de
          * los dos (más blanco, en la misma familia del H1 de arriba pero sin
          * llegar a su blanco pleno), y el de abajo queda claramente como la
          * frase de apoyo secundaria: más chica y en el gris más apagado
          * (#6F7876) que ya usa el resto de la página. */}
        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          fontWeight: 300,
          fontSize: '21px',
          color: 'rgba(245,247,247,0.85)',
          margin: '0 0 16px',
          maxWidth: '520px',
          lineHeight: 1.6
        }}>
          Beacon devuelve la visibilidad sobre tu pipeline indirecto con seguimiento inteligente y pulse checks automáticos.
        </p>

        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '17px',
          color: '#6F7876',
          margin: '0 0 40px',
          maxWidth: '520px',
          lineHeight: 1.6
        }}>
          Menos seguimiento manual. Más oportunidades bajo control.
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignSelf: 'flex-start',
          marginTop: '48px',
          animation: 'bounceArrow 2s ease-in-out infinite'
        }}>
          <ArrowDown size={120} color="#B0FF92" strokeWidth={1} />
        </div>
        </div>
      </section>

      {/* EL PROBLEMA SECTION */}
      <section style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '120px 80px'
      }}>
        <p style={{
          fontFamily: "'Satoshi', sans-serif",
          fontWeight: 300,
          fontSize: '32px',
          color: '#B0FF92',
          letterSpacing: '0',
          margin: '0 0 24px'
        }}>
          Sin visibilidad, sin control
        </p>

        <div style={{width:'100%', maxWidth:'400px', height:'1px', background:'linear-gradient(to right, rgba(255,255,255,0.15), rgba(255,255,255,0.05), transparent)', margin:'8px 0 32px'}} />

        <h2 style={{
          fontFamily: "'Satoshi', sans-serif",
          fontWeight: 300,
          fontSize: '48px',
          color: '#F5F7F7',
          margin: '0 0 64px',
          maxWidth: '600px',
          lineHeight: 1.2,
          letterSpacing: '-0.02em'
        }}>
          El CAM no debería operar en la oscuridad.
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '48px'
        }}>
          {[
            {
              number: '01',
              title: 'Sin visibilidad real',
              description: 'Una vez que la oportunidad pasa al partner, el CAM pierde el control. No sabe si avanza, si está estancada o si ya se cayó.'
            },
            {
              number: '02',
              title: 'Seguimiento manual agotador',
              description: 'Perseguir a cada partner por email o teléfono consume horas que deberían invertirse en cerrar más deals.'
            },
            {
              number: '03',
              title: 'Bonos en riesgo',
              description: 'Las ventas cerradas sin atribución a tiempo significan bono perdido. Y el CAM es responsable del resultado sin tener la visibilidad para garantizarlo.'
            }
          ].map(item => (
            <div key={item.number}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#B0FF92',
                boxShadow: '0 0 0 2px rgba(176,255,146,0.2), 0 0 8px 3px rgba(176,255,146,0.4), 0 0 16px 6px rgba(176,255,146,0.15)',
                marginBottom: '16px'
              }} />
              {/* 2026-10-19, a pedido de Ana: bajarle un poquito al stroke/
                * negrita de estos títulos ("Sin visibilidad real", etc).
                * Estaba en 600, pero Satoshi solo tiene cargados los pesos
                * 300/400/500/700 (ver index.html) -- al no existir el 600
                * real, el navegador lo aproximaba al 700 (bold), por eso se
                * veía más negrita de lo esperado. 500 sí es un peso real de
                * la fuente, así que queda más fiel y más liviano. */}
              <h3 style={{
                fontFamily: "'Satoshi', sans-serif",
                fontWeight: 500,
                fontSize: '20px',
                color: '#F5F7F7',
                margin: '0 0 12px'
              }}>
                {item.title}
              </h3>
              <p style={{
                fontFamily: 'DM Sans',
                fontSize: '15px',
                color: '#6F7876',
                lineHeight: 1.7,
                margin: 0
              }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SLIDER SECTION */}
      <section ref={sliderSectionRef} style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '120px 80px'
      }}>
        <div style={{ display: 'flex', gap: '80px', alignItems: 'center' }}>
          {/* LEFT: description */}
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontFamily: "'Satoshi', sans-serif",
              fontWeight: 300,
              fontSize: '48px',
              color: '#F5F7F7',
              margin: '0 0 24px',
              lineHeight: 1.2,
              letterSpacing: '-0.02em'
            }}>
              Una op. Tres estados. Todo bajo seguimiento.
            </h2>

            {/* Step indicators */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
              {steps.map((step, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setAutoPlay(false)
                    goToStep(i)
                  }}
                  style={{
                    width: i === currentStep ? '32px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: i === currentStep ? '#B0FF92' : 'rgba(255,255,255,0.15)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    padding: 0
                  }}
                />
              ))}
            </div>

            <p style={{
              fontFamily: 'DM Sans',
              fontSize: '18px',
              color: '#A3AEAC',
              lineHeight: 1.7,
              margin: 0,
              maxWidth: '400px'
            }}>
              {steps[currentStep].description}
            </p>
          </div>

          {/* RIGHT: card preview */}
          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px'
          }}>
            <div style={{
              width: '280px',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${steps[currentStep].color}40`,
              borderRadius: '12px',
              padding: '14px 16px',
              boxShadow: isTransitioning ? `0 0 60px ${steps[currentStep].color}40, 0 0 120px ${steps[currentStep].color}20` : `0 0 40px ${steps[currentStep].color}15`,
              transition: 'all 0.4s ease',
              filter: isTransitioning ? 'blur(4px) brightness(1.5)' : 'blur(0px) brightness(1)',
              transform: isTransitioning ? 'translateX(40px)' : 'translateX(0)',
              opacity: isTransitioning ? 0.3 : 1
            }}>
              <div style={{display:'inline-flex',alignItems:'center',gap:'6px',background:`${steps[currentStep].color}15`,border:`1px solid ${steps[currentStep].color}30`,borderRadius:'20px',padding:'4px 10px',marginBottom:'12px'}}>
                <div style={{width:6,height:6,borderRadius:'50%',background:steps[currentStep].color}}/>
                <span style={{fontFamily:'DM Sans',fontSize:'11px',color:steps[currentStep].color}}>
                  {steps[currentStep].label}
                </span>
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#F5F7F7', margin: '0 0 2px', lineHeight: 1.2, fontFamily: 'Satoshi, sans-serif' }}>
                {steps[currentStep].cliente}
              </p>
              <p style={{ fontSize: 13, color: '#A3AEAC', fontFamily: 'DM Sans, sans-serif', margin: '0 0 14px' }}>
                {steps[currentStep].partner}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <p style={{ fontSize: 13, color: '#6F7876', fontFamily: 'DM Sans', margin: '0 0 2px' }}>
                    {steps[currentStep].producto}
                  </p>
                  <p style={{ fontSize: 12, color: '#6F7876', fontFamily: 'DM Sans', margin: 0 }}>
                    {steps[currentStep].cantidad}
                  </p>
                </div>
                <div style={{ padding: '3px 8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, fontSize: 11, color: '#A3AEAC', fontFamily: 'DM Sans', flexShrink: 0 }}>
                  {steps[currentStep].contrato}
                </div>
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#F5F7F7', fontFamily: 'Satoshi, sans-serif', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
                {steps[currentStep].valor}
              </p>
              <p style={{fontSize:11,color:'#6F7876',fontFamily:'DM Sans',margin:'0 0 8px',lineHeight:1.4,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
                {steps[currentStep].resumen}
              </p>
              <p style={{ fontSize: 11, color: steps[currentStep].color, margin: 0 }}>
                {steps[currentStep].badge}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* EN ACCION SECTION */}
      <section style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '120px 80px'
      }}>
        <p style={{fontFamily:"'Satoshi', sans-serif", fontWeight:300, fontSize:'32px', color:'#B0FF92', letterSpacing:0, margin:'0 0 24px'}}>
          Así funciona
        </p>

        <div style={{width:'100%', maxWidth:'400px', height:'1px', background:'linear-gradient(to right, rgba(255,255,255,0.15), rgba(255,255,255,0.05), transparent)', margin:'8px 0 32px'}} />

        <div style={{ display: 'flex', gap: '80px', alignItems: 'center' }}>
          {/* LEFT: animation */}
          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '360px',
            position: 'relative'
          }}>
            {/* Step 0: Pipeline card */}
            {animStep === 0 && (
              <div style={{
                width:'680px',
                background:'rgba(255,255,255,0.04)',
                border:'1px solid rgba(255,255,255,0.06)',
                borderRadius:12,
                padding:'20px 24px',
                display:'flex',
                alignItems:'center',
                gap:24,
                boxShadow:'0 20px 60px rgba(0,0,0,0.5)',
                animation:animBlur?'exitBlur 0.4s ease forwards':'floatIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards,floating 4s ease-in-out 0.6s infinite'
              }}>
                <p style={{fontSize:11,color:'#A3AEAC',fontFamily:'DM Sans',margin:'0 0 12px',letterSpacing:'0.06em',textTransform:'uppercase'}}>+ Nueva oportunidad</p>
                <div style={{flex:2}}>
                  <p style={{fontSize:15,fontWeight:700,color:'#F5F7F7',margin:'0 0 2px',fontFamily:'Satoshi,sans-serif'}}>Clearview Systems</p>
                  <p style={{fontSize:14,color:'#A3AEAC',fontFamily:'DM Sans,sans-serif',margin:0}}>Apex Partners</p>
                </div>
                <div style={{flex:1}}>
                  <p style={{fontSize:14,color:'#A3AEAC',fontFamily:'DM Sans',margin:0}}>Anual</p>
                </div>
                <div style={{flex:1}}>
                  <p style={{fontSize:14,color:'#A3AEAC',fontFamily:'DM Sans',margin:'0 0 2px'}}>Nexus AI Assistant</p>
                  <p style={{fontSize:13,color:'#A3AEAC',fontFamily:'DM Sans',margin:0}}>50 licencias</p>
                </div>
                <div style={{flex:1}}>
                  <p style={{fontSize:14,fontWeight:700,color:'#F5F7F7',fontFamily:'Satoshi,sans-serif',margin:0}}>$89,000</p>
                </div>
                <div style={{flex:1}}>
                  <p style={{fontSize:14,color:'#A3AEAC',fontFamily:'DM Sans',margin:0}}>Hoy</p>
                </div>
                <button style={{background:'rgba(176,255,146,0.08)',border:'1px solid rgba(176,255,146,0.15)',borderRadius:8,padding:'7px 14px',color:'#B0FF92',fontSize:13,fontFamily:'DM Sans',cursor:'default',flexShrink:0}}>
                  Ver oportunidad
                </button>
              </div>
            )}

            {/* Step 1: Ficha */}
            {animStep === 1 && (
              <div style={{
                width:'380px',
                background:'rgba(255,255,255,0.04)',
                border:'1px solid rgba(255,255,255,0.08)',
                borderRadius:12,
                padding:'24px',
                boxShadow:'0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(123,88,248,0.15)',
                animation:animBlur?'exitBlur 0.4s ease forwards':'floatIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards,floating 4s ease-in-out 0.6s infinite'
              }}>
                <p style={{fontFamily:'Satoshi,sans-serif',fontWeight:300,fontSize:'28px',color:'#F5F7F7',margin:'0 0 4px'}}>Clearview Systems</p>
                <p style={{fontFamily:'DM Sans',fontSize:'14px',color:'#A3AEAC',margin:'0 0 20px'}}>Apex Partners</p>

                <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:'16px',marginBottom:'16px'}}>
                  <p style={{fontFamily:'DM Sans',fontSize:'10px',color:'#6F7876',textTransform:'uppercase',letterSpacing:'0.08em',margin:'0 0 12px'}}>Deal</p>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:'16px'}}>
                    <div>
                      <p style={{fontFamily:'DM Sans',fontSize:'10px',color:'#6F7876',textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 4px'}}>Cliente</p>
                      <p style={{fontFamily:'DM Sans',fontSize:'13px',color:'#F5F7F7',margin:0}}>Clearview Systems</p>
                    </div>
                    <div>
                      <p style={{fontFamily:'DM Sans',fontSize:'10px',color:'#6F7876',textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 4px'}}>Partner</p>
                      <p style={{fontFamily:'DM Sans',fontSize:'13px',color:'#F5F7F7',margin:0}}>Apex Partners</p>
                    </div>
                  </div>
                  <p style={{fontFamily:'DM Sans',fontSize:'10px',color:'#6F7876',textTransform:'uppercase',letterSpacing:'0.08em',margin:'0 0 12px'}}>Contrato</p>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:'16px'}}>
                    <div>
                      <p style={{fontFamily:'DM Sans',fontSize:'10px',color:'#6F7876',textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 4px'}}>Valor</p>
                      <p style={{fontFamily:'Satoshi,sans-serif',fontWeight:700,fontSize:'16px',color:'#F5F7F7',margin:0}}>$89,000</p>
                    </div>
                    <div>
                      <p style={{fontFamily:'DM Sans',fontSize:'10px',color:'#6F7876',textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 4px'}}>Tipo</p>
                      <p style={{fontFamily:'DM Sans',fontSize:'13px',color:'#F5F7F7',margin:0}}>Anual</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Chat */}
            {animStep === 2 && (
              <div style={{
                width: '340px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '20px',
                animation: animBlur ? 'exitBlur 0.4s ease forwards' : 'floatIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards, floating 4s ease-in-out 0.6s infinite',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(176,255,146,0.1)'
              }}>
                <p style={{ fontFamily: 'DM Sans', fontSize: '10px', color: '#6F7876', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 16px' }}>Conversación con Apex Partners</p>
                <div style={{ background: 'rgba(176,255,146,0.08)', border: '1px solid rgba(176,255,146,0.15)', borderRadius: '12px 12px 2px 12px', padding: '10px 14px', marginBottom: '8px', marginLeft: '40px' }}>
                  <p style={{ fontFamily: 'DM Sans', fontSize: '12px', color: '#F5F7F7', margin: '0 0 4px', lineHeight: 1.5 }}>Hola, ¿cómo va el proceso con Clearview Systems?</p>
                  <p style={{ fontFamily: 'DM Sans', fontSize: '10px', color: '#6F7876', margin: 0 }}>Enviado ✓ · Hoy</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '2px 12px 12px 12px', padding: '10px 14px', marginRight: '40px', marginBottom: '16px' }}>
                  <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#6F7876', margin: '0 0 6px' }}>Respuesta rápida</p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(176,255,146,0.08)', border: '1px solid rgba(176,255,146,0.2)', borderRadius: '20px', padding: '4px 10px' }}>
                    <span style={{ fontFamily: 'DM Sans', fontSize: '12px', color: '#B0FF92' }}>✓ En negociación</span>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px' }}>✨</span>
                  <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#6F7876', margin: 0 }}>Siguiente mensaje generado con IA</p>
                </div>
              </div>
            )}

            {/* Step 3: Sin respuesta */}
            {animStep === 3 && (
              <div style={{
                width: '280px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(249,115,22,0.3)',
                borderRadius: 12,
                padding: '14px 16px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(249,115,22,0.2)',
                animation: animBlur ? 'exitBlur 0.4s ease forwards' : 'bounceIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards, floating 4s ease-in-out 0.7s infinite'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#F5F7F7', margin: '0 0 2px', lineHeight: 1.2, flex: 1, fontFamily: 'Satoshi, sans-serif' }}>
                    Clearview Systems
                  </p>
                </div>
                <p style={{ fontSize: 13, color: '#A3AEAC', fontFamily: 'DM Sans, sans-serif', margin: '0 0 14px' }}>
                  Apex Partners
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <p style={{ fontSize: 13, color: '#6F7876', fontFamily: 'DM Sans', margin: '0 0 2px' }}>Nexus AI Assistant</p>
                    <p style={{ fontSize: 12, color: '#6F7876', fontFamily: 'DM Sans', margin: 0 }}>50 licencias</p>
                  </div>
                  <div style={{ padding: '3px 8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, fontSize: 11, color: '#A3AEAC', fontFamily: 'DM Sans', flexShrink: 0 }}>
                    Anual
                  </div>
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#F5F7F7', fontFamily: 'Satoshi, sans-serif', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
                  $89,000
                </p>
                <p style={{ fontSize: 11, color: '#6F7876', fontFamily: 'DM Sans, sans-serif', margin: '0 0 6px', lineHeight: 1.4 }}>
                  Tres pulsos enviados sin respuesta. Última respuesta indicó proceso activo.
                </p>
                <p style={{ fontSize: 11, color: '#F97316', margin: 0 }}>
                  15 días sin respuesta
                </p>
              </div>
            )}
          </div>

          {/* RIGHT: text */}
          <div style={{ flex: 1, paddingLeft: '40px', transition: 'opacity 0.4s ease', opacity: animBlur ? 0 : 1 }}>
            <div key={animStep} style={{ animation: 'fadeIn 0.6s ease forwards' }}>
              <h2 style={{
                fontFamily: "'Satoshi', sans-serif",
                fontWeight: 300,
                fontSize: '42px',
                color: '#F5F7F7',
                margin: '0 0 20px',
                lineHeight: 1.2,
                letterSpacing: '-0.02em'
              }}>
                {animStep === 0 && 'La oportunidad llega.'}
                {animStep === 1 && 'Beacon la analiza.'}
                {animStep === 2 && 'El pulse check sale solo.'}
                {animStep === 3 && 'Sabes exactamente dónde actuar.'}
              </h2>
              <p style={{
                fontFamily: 'DM Sans',
                fontSize: '16px',
                color: '#6F7876',
                lineHeight: 1.7,
                margin: 0,
                maxWidth: '380px'
              }}>
                {animStep === 0 && 'El partner recibe una nueva op. Sin Beacon, nadie sabe qué pasa después.'}
                {animStep === 1 && 'Beacon registra el contexto y prepara un mensaje personalizado con IA.'}
                {animStep === 2 && 'El CAM no tiene que escribir nada. Beacon contacta al partner automáticamente.'}
                {animStep === 3 && 'Cuando una op necesita atención, Beacon te avisa. Sin revisar manualmente.'}
              </p>
            </div>

            {/* 2026-10-19, a pedido de Ana: puntitos para que se note que esta
              * tarjeta cambia sola (son 4 pasos) -- a alguien se le mostró y
              * pasó de largo sin darse cuenta. Van del lado del texto (que es
              * el que guía la narrativa), no del lado de la animación, y con
              * el mismo tamaño que el indicador de pasos de "Una op. Tres
              * estados." más arriba (8px/32px, gap 12px). Fuera del div con
              * key={animStep} para que no se vuelvan a montar (y por lo tanto
              * no parpadeen) en cada cambio de paso -- solo el punto activo
              * se anima suavemente. */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  style={{
                    width: i === animStep ? '32px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: i === animStep ? '#B0FF92' : 'rgba(255,255,255,0.15)',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* METRICS SECTION */}
      <section ref={metricsSectionRef} style={{
        padding: '120px 80px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center'
      }}>
        {/* 2026-10-19, a pedido de Ana: el bloque "Basado en usuarios beta"
          * quedaba muy pegado a la fila de métricas (13.3 hrs / 3 de 10 /
          * 100%) de abajo. Margen de separación: 48px -> 80px -> 112px. */}
        <div style={{display:'flex', flexDirection:'column', marginBottom:'112px', alignSelf:'flex-end'}}>
          <p style={{
            fontFamily: "'Satoshi', sans-serif",
            fontWeight: 300,
            fontSize: '32px',
            color: '#B0FF92',
            letterSpacing: 0,
            margin: '0 0 4px',
            textAlign: 'right'
          }}>
            Basado en usuarios beta
          </p>
          <div style={{height:'1px', background:'linear-gradient(to left, rgba(255,255,255,0.3), transparent)', margin:'0 0 12px'}} />
          <p style={{
            fontFamily: 'DM Sans',
            fontSize: '18px',
            color: '#A3AEAC',
            lineHeight: 1.7,
            marginTop: '-8px',
            textAlign: 'right',
            maxWidth: '380px'
          }}>
            Métricas construidas desde conversaciones reales con Channel Account Managers.
          </p>
        </div>

        <div style={{display:'flex', gap:'240px', justifyContent:'center', width:'100%'}}>
          {[
            { label: 'recuperadas al mes por CAM', format: v => `${v.toFixed(1)} hrs` },
            { label: 'ops pierden seguimiento sin Beacon', format: v => `${Math.round(v)} de 10` },
            { label: 'de pulse checks generados con IA', format: v => `${Math.round(v)}%` }
          ].map((metric, i) => (
            <div key={metric.label} style={{textAlign: 'center'}}>
              <p style={{fontFamily:"'Satoshi', sans-serif", fontWeight:700, fontSize:'64px', color:'#F5F7F7', margin:'0 0 8px', letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums'}}>
                {metric.format(metricValues[i])}
              </p>
              <p style={{
                fontFamily: 'DM Sans',
                fontSize: '15px',
                color: '#6F7876',
                margin: 0,
                lineHeight: 1.5
              }}>
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PARA QUIÉN ES SECTION */}
      <section style={{
        padding: '120px 80px',
        borderTop: '1px solid rgba(255,255,255,0.06)'
      }}>
        <h2 style={{
          fontFamily: "'Satoshi', sans-serif",
          fontWeight: 300,
          fontSize: '48px',
          color: '#F5F7F7',
          margin: '0 0 48px',
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
          maxWidth: '600px'
        }}>
          Hecho para quienes venden a través de partners.
        </h2>
        <div style={{display:'flex', flexDirection:'column', maxWidth:'100%', width:'100%'}}>
          {[
            { title: 'Channel Account Managers', description: 'CAMs que gestionan docenas de oportunidades a través de partners y necesitan visibilidad real sobre qué está pasando con cada deal.' },
            { title: 'Empresas tech con ventas indirectas', description: 'Compañías que venden a través de canales de distribución y necesitan que sus CAMs operen con información completa y actualizada.' },
            { title: 'Equipos de ventas indirectas', description: 'Equipos que buscan reducir el tiempo de seguimiento manual y garantizar que ninguna atribución se pierda por falta de visibilidad.' }
          ].map((item, i) => (
            <div key={i} style={{display:'flex', gap:'80px', alignItems:'flex-start', paddingTop:'32px', paddingBottom:'32px', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none'}}>
              <div style={{flex:'0 0 280px'}}>
                <div style={{width:'8px', height:'8px', borderRadius:'50%', background:'#B0FF92', boxShadow:'0 0 0 2px rgba(176,255,146,0.2), 0 0 8px 3px rgba(176,255,146,0.4)', marginBottom:'12px'}} />
                <p style={{fontFamily:"'Satoshi', sans-serif", fontWeight:600, fontSize:'22px', color:'#F5F7F7', margin:0}}>{item.title}</p>
              </div>
              <p style={{fontFamily:'DM Sans', fontSize:'15px', color:'#6F7876', lineHeight:1.7, margin:0, flex:1}}>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL SECTION */}
      <section style={{
        padding: '120px 80px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        textAlign: 'center'
      }}>
        <div style={{
          position: 'relative',
          width: '100%',
          height: '900px',
          marginBottom: '48px'
        }}>
          <div style={{
            position: 'absolute',
            left: '0',
            top: '0',
            width: '55%',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
            maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
            zIndex: 1
          }}>
            <img src={captureHero} style={{width:'100%', display:'block'}} />
          </div>
          <div style={{
            position: 'absolute',
            right: '0',
            top: '40px',
            width: '55%',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
            maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
            zIndex: 2
          }}>
            <img src={capturePipeline} style={{width:'100%', display:'block'}} />
          </div>
          <div style={{
            position: 'absolute',
            left: '0',
            top: '320px',
            width: '50%',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
            maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
            zIndex: 3
          }}>
            <img src={captureDetail} style={{width:'100%', display:'block'}} />
          </div>
        </div>

        <div style={{
          marginTop: '24px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '24px'
        }}>
          <h3 style={{
            fontFamily: "'Satoshi', sans-serif",
            fontWeight: 300,
            fontSize: '40px',
            color: '#F5F7F7',
            margin: 0,
            marginTop: '-24px',
            letterSpacing: '-0.01em',
            lineHeight: 1.3,
            maxWidth: '600px'
          }}>
            Cada oportunidad merece seguir siendo visible.
          </h3>
          <button
            onClick={() => navigate('/pipeline')}
            style={{
              background: '#B0FF92',
              color: '#121716',
              border: 'none',
              borderRadius: '8px',
              padding: '14px 40px',
              fontFamily: 'DM Sans',
              fontSize: '18px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            Explora el demo <ChevronRight size={16} />
          </button>
        </div>
      </section>
    </div>
  )
}
