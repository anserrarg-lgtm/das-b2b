# Opportunity Lifecycle

> Describe el ciclo de vida completo de una oportunidad en Beacon.
> Para definiciones de términos ver GLOSSARY.md.
> Para entender quién produce cada cambio ver ACTORS.md.

---

## Qué es una oportunidad

Una oportunidad representa un deal que el CAM está siguiendo a través de un partner. No es solo un registro — es un deal vivo que cambia de estado según lo que hacen el CAM, el partner y el sistema.

---

## Los estados

### Nueva
La oportunidad acaba de ser cargada al sistema. No tiene acción asignada todavía.

**Quién la produce:** el CAM, al importar manualmente o via Excel.
**Qué puede hacer el CAM:** enviar el primer Pulse Check individualmente o en masa para todas las nuevas a la vez.
**Transición automática:** ninguna. El CAM debe actuar.

---

### Esperando respuesta
Se envió un Pulse Check al partner. El deal está activo y Beacon espera respuesta.

**Quién la produce:** el CAM o el sistema, al enviar un Pulse Check.
**Qué puede hacer el CAM:** esperar, poner en espera, escalar, cerrar o descalificar.
**Transición automática:** si pasan más días de los configurados sin actividad, pasa a Sin respuesta.

---

### Sin respuesta
Han pasado más días de los configurados sin actividad desde el último Pulse Check. El deal está estancado.

**Quién la produce:** el sistema, automáticamente al detectar inactividad.
**Qué puede hacer el CAM:** enviar otro Pulse Check, poner en espera, escalar o descalificar.
**Si lleva más de 30 días:** aparece en la sección "Requiere atención" de notificaciones con opciones concretas de acción.
**Transición automática:** ninguna. El CAM debe actuar.

---

### Respondida
El partner respondió al Pulse Check. Hay nueva información sobre el deal.

**Quién la produce:** el partner, al responder al email del Pulse Check.
**Qué puede hacer el CAM:** revisar la respuesta en el chat, enviar otro Pulse Check, poner en espera, cerrar o descalificar.
**Transición automática:** ninguna. El CAM decide el siguiente paso.

---

### Venta confirmada
El partner confirmó que el deal se cerró. Beacon inicia el contador de atribución.

**Quién la produce:** el CAM, al marcar la oportunidad como ganada después de recibir confirmación del partner.
**Qué muestra Beacon:** "Vence en X días" con código de color según urgencia.
**Transición automática:** ninguna, pero el contador de atribución corre.

---

### En espera
El CAM pausó la oportunidad hasta una fecha específica.

**Quién la produce:** el CAM, manualmente.
**Cuándo se usa:** cuando el cliente está en proceso de evaluación, hay una fecha de decisión conocida, o no hay nada que hacer hasta un momento específico.
**Configuración:** el CAM puede elegir si al reactivarse se envía automáticamente un Pulse Check.
**Transición automática:** el sistema reactiva la oportunidad en la fecha configurada y la devuelve al estado anterior.

---

### Ganada
El deal se cerró exitosamente y el CAM lo registró.

**Quién la produce:** el CAM, al cerrar la oportunidad como ganada.
**Dónde vive:** en el Historial.
**Puede reactivarse:** si el partner responde más adelante, Beacon notifica al CAM con opción de reactivar.

---

### Descalificada
El CAM decidió que el deal no va a prosperar.

**Quién la produce:** el CAM, al descalificar la oportunidad.
**Dónde vive:** en el Historial.
**Puede reactivarse:** igual que Ganada — si el partner responde, Beacon notifica.

---

## Diagrama de transiciones

Nueva
└─→ Esperando respuesta (CAM envía Pulse Check)
└─→ Sin respuesta (sistema detecta inactividad)
└─→ Respondida (partner responde)
└─→ Esperando respuesta (CAM envía otro Pulse Check)
└─→ Venta confirmada (CAM confirma cierre)
└─→ Ganada (CAM registra atribución)

Cualquier estado activo puede ir a:
└─→ En espera (CAM pausa) → vuelve al estado anterior (sistema reactiva)
└─→ Descalificada (CAM descalifica) → Historial

---

## Notificaciones del ciclo de vida

- Pulse Check enviado → notificación informativa
- Partner respondió → notificación informativa
- Venta confirmada → notificación informativa
- Oportunidad sin respuesta 30+ días → notificación en "Requiere atención"
- Partner respondió a oportunidad en historial → notificación en "Requiere atención"
- Oportunidad reactivada desde espera → notificación informativa
