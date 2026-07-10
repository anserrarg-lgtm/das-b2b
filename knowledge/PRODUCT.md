# Beacon — Product Overview

> Visión general del producto. Para profundizar en cada tema, cada sección referencia el documento correspondiente.
> Este documento responde a una sola pregunta: ¿qué es Beacon y por qué existe?

---

## Qué es Beacon

Beacon es una plataforma B2B de visibilidad para ventas indirectas. Fue creada para resolver un problema estructural del modelo de channel sales: en el momento en que una oportunidad pasa a manos de un partner, el CAM pierde el control.

Sin Beacon, el CAM opera a ciegas. Depende del partner para saber qué está pasando con sus propios deals, hace seguimiento manual uno a uno, y arriesga perder la atribución de ventas ya cerradas por falta de visibilidad.

Beacon centraliza esa visibilidad, automatiza el seguimiento y protege el bono del CAM.

**Tagline:** *"Sin ops en la oscuridad."*

---

## El problema

El problema tiene tres capas:

**Visibilidad perdida** — el CAM no sabe qué pasa con sus deals una vez que están en manos del partner.

**Seguimiento manual insostenible** — con 30 oportunidades activas, no hay forma de hacer seguimiento individual con consistencia.

**Atribución en riesgo** — si el partner cierra un deal y el CAM no lo registra dentro del período de atribución, pierde la comisión aunque haya trabajado ese deal durante meses.

→ Ver ATTRIBUTION.md para entender el sistema de atribución en detalle.

---

## Cómo lo resuelve

El mecanismo central son los **Pulse Checks** — mensajes generados con IA y enviados automáticamente al partner para verificar el estado de cada oportunidad. El CAM no tiene que escribirlos — Beacon los escribe por él, con contexto, en el momento correcto.

→ Ver PULSE_CHECKS.md para entender cómo funcionan.
→ Ver OPPORTUNITY_LIFECYCLE.md para entender el ciclo de vida completo de una oportunidad.

---

## Los actores

Beacon fue diseñado exclusivamente para el **CAM**. El partner no tiene acceso al sistema — solo recibe un email y responde. Esta decisión fue intencional.

→ Ver ACTORS.md para entender cada actor y su rol.
→ Ver DECISIONS.md para entender por qué el partner no tiene acceso propio.

---

## Filosofía

**Visibilidad antes que automatización.** Beacon no reemplaza al CAM ni toma decisiones por él. Le da información para que pueda actuar. El CAM siempre tiene la última palabra.

**Fricción mínima.** El MVP evita integraciones complejas por diseño. Excel como puente de importación, email simulado con arquitectura lista para producción. El objetivo es demostrar valor antes de construir infraestructura.

**"Sin ops en la oscuridad"** no es solo un tagline — es la pregunta de diseño que guía cada decisión del producto.

→ Ver DECISIONS.md para el registro completo de decisiones históricas.

---

## Estado actual

Beacon es un prototipo funcional frontend-only con datos mock. Demuestra el valor del producto pero no está conectado a servicios reales.

→ Ver STACK.md para entender la arquitectura técnica.
→ Ver ROADMAP.md para saber qué viene después.
