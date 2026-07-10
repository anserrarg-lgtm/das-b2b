# Attribution

> Describe el sistema de atribución de Beacon y por qué es crítico para el CAM.
> Para definiciones ver GLOSSARY.md.
> Para entender cómo la atribución afecta el ciclo de vida ver OPPORTUNITY_LIFECYCLE.md.

---

## Qué es la atribución

La atribución es el registro formal que acredita al CAM como responsable de un deal cerrado. Sin atribución registrada dentro del período correspondiente, el CAM no cobra la comisión de esa venta — aunque haya trabajado ese deal durante meses.

Es una regla de negocio real impuesta por los fabricantes. No es una decisión de Beacon.

---

## Por qué existe el período de atribución

Los fabricantes que venden a través de canales indirectos establecen ventanas de tiempo durante las cuales el CAM puede reclamar la atribución de una venta. Fuera de esa ventana, la venta no cuenta para el bono aunque el CAM haya trabajado el deal.

El período varía según el fabricante y el acuerdo comercial de cada empresa. En Beacon el valor por defecto es 60 días, pero es configurable por el CAM en su perfil.

---

## Cómo funciona en Beacon

Cuando una oportunidad pasa a "Venta confirmada", Beacon inicia automáticamente un contador de días.

El CAM tiene ese período para registrar formalmente la atribución. Beacon protege ese proceso de dos formas:

**Visualmente en las cards:**
Las oportunidades en estado "Venta confirmada" muestran "Vence en X días" con código de color según urgencia:
- Verde: tiempo suficiente
- Naranja: menos de 14 días
- Rojo: menos de 5 días
- Vencido: período expirado

**Por notificación:**
Beacon alerta al CAM cuando una atribución está próxima a vencer para que pueda actuar a tiempo.

---

## El bono del CAM

El bono de compensación del CAM se calcula mensualmente con esta estructura típica:

- Revenue atribuido: 40%
- Referidos aceptados: 40%
- Asistencia: 20%

Beacon no calcula el bono directamente — eso es responsabilidad del sistema de compensación de la empresa. Lo que hace Beacon es asegurarse de que ninguna venta se pierda por falta de seguimiento administrativo.

---

## Configuración

El CAM puede configurar en su perfil:
- El período de atribución en días
- La moneda
- El salario base y el split salarial
- El ciclo de rendimiento

Esta configuración afecta directamente cómo se muestran las alertas de vencimiento en el pipeline.

---

## Por qué esto importa

El CAM puede trabajar un deal durante semanas, conseguir que el partner lo cierre, y perder la comisión simplemente porque el partner no avisó a tiempo y el CAM no tenía visibilidad para detectarlo.

Beacon resuelve exactamente eso. No la atribución en sí — eso es un proceso externo — sino la visibilidad y la alerta a tiempo para que el CAM nunca pierda una venta que ya ganó.
