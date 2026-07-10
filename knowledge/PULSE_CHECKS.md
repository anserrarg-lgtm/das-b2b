# Pulse Checks

> Describe qué son los Pulse Checks, por qué existen y cómo funcionan.
> Para entender cuándo se generan en el ciclo de vida ver OPPORTUNITY_LIFECYCLE.md.
> Para definiciones ver GLOSSARY.md.

---

## Qué son

Un Pulse Check es un mensaje de seguimiento enviado al partner para preguntar por el estado de una oportunidad. No es un recordatorio interno para el CAM — es el acto de contactar al partner, automatizado.

---

## Por qué son el corazón del producto

El problema central que resuelve Beacon es el seguimiento manual. Un CAM con 30 oportunidades activas no puede escribirle a cada partner con consistencia. Las oportunidades silenciosas se caen solas — no por falta de intención, sino por falta de sistema.

El Pulse Check ataca el problema en su raíz: en lugar de recordarle al CAM que tiene que escribir, Beacon escribe por él. Con contexto de la oportunidad específica. En el momento correcto. Sin que el CAM tenga que recordarlo.

La diferencia entre un recordatorio y un Pulse Check es la misma que entre decirle a alguien que llame a su cliente y hacerle la llamada.

---

## Tipos de Pulse Check

### Automático
Generado por IA (Claude Sonnet) con contexto de la oportunidad: cliente, partner, historial de conversación y estado actual. El mensaje es relevante y específico — no un email genérico.

El CAM puede revisar y editar el mensaje antes de enviarlo si tiene activado "Revisar antes de enviar" en su perfil. Si no, se envía directamente.

### Manual
Escrito por el CAM directamente desde la UI de chat de la oportunidad. Se usa cuando el CAM quiere controlar el tono o el contenido del mensaje.

---

## Cuándo se generan

- Cuando el CAM envía el primer Pulse Check a una oportunidad nueva
- Cuando el CAM decide hacer seguimiento desde la ficha de la oportunidad
- Cuando el CAM envía Pulse Checks en masa a todas las oportunidades nuevas
- Cuando una oportunidad se reactiva desde "En espera" con la opción de Pulse Check automático activada

---

## Estado actual de implementación

El envío real de emails está simulado en el prototipo. Beacon registra el Pulse Check en el estado local y muestra la conversación en la UI de chat, pero no realiza ninguna llamada a un servidor de correo.

La integración real está planificada con Resend. La arquitectura fue diseñada desde el inicio para que esta conexión sea directa cuando el producto pase a producción — ver ROADMAP.md.

---

## La conversación

Cada oportunidad tiene su propio historial de conversación con el partner. El CAM puede ver todos los Pulse Checks enviados y las respuestas del partner en orden cronológico, desde el más antiguo hasta el más reciente.

El chat abre siempre mostrando los mensajes más recientes. El CAM puede hacer scroll hacia arriba para ver el historial completo.

---

## Respuestas del partner

El partner puede responder de dos formas:
- **Respuesta rápida**: opción predefinida (ej. "En proceso", "En negociación", "Deal cerrado")
- **Respuesta de texto**: mensaje libre con más detalle

Ambas quedan registradas en el historial de conversación de la oportunidad.

---

## Canales planificados

Actualmente los Pulse Checks se envían por email. En el roadmap está planificada la integración con WhatsApp Business API como canal alternativo — ver ROADMAP.md.
