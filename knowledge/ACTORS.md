# Actors

> Describe cada actor que existe en el ecosistema de Beacon, sus responsabilidades y su relación con el producto.
> Para definiciones de términos ver GLOSSARY.md.

---

## Channel Account Manager (CAM)

El usuario principal de Beacon. El producto fue diseñado enteramente desde su perspectiva.

**Qué hace:**
- Gestiona entre 20 y 50 oportunidades simultáneas asignadas a distintos partners
- Hace seguimiento del estado de cada deal sin acceso directo al cliente final
- Envía y revisa Pulse Checks para mantener comunicación con los partners
- Registra ventas confirmadas dentro del período de atribución para proteger su bono
- Toma decisiones sobre cada oportunidad: escalar, poner en espera, cerrar o descalificar

**Su dolor principal:**
Depende del partner para tener información sobre sus propios deals. Sin Beacon, esa dependencia se gestiona manualmente — uno a uno, sin sistema, sin visibilidad centralizada.

**Su motivación económica:**
Su bono de compensación depende directamente de los deals que cierra y registra a tiempo. Perder la atribución de una venta por falta de seguimiento es perder dinero real.

---

## Partner

El distribuidor o revendedor externo que trabaja el deal con el cliente final.

**Qué hace:**
- Ejecuta la venta con el cliente
- Recibe Pulse Checks de Beacon vía email
- Responde sobre el estado de la oportunidad

**Su relación con Beacon:**
No es usuario del sistema. No tiene acceso, panel ni cuenta. Su único punto de contacto es recibir un email y responder. Esta decisión fue intencional — ver DECISIONS.md.

**Por qué no tiene acceso propio:**
El partner no tiene incentivo para adoptar una herramienta nueva que no fue diseñada para él. Obligarlo a aprender un sistema externo habría creado fricción y bloqueado el MVP. Beacon elige que el partner haga lo mínimo posible.

---

## Manager

El superior del CAM dentro de la organización.

**Su relación con Beacon:**
No tiene acceso propio en el MVP actual. Aparece de forma indirecta: cuando una oportunidad lleva más de 30 días sin respuesta, Beacon ayuda al CAM a generar un resumen con IA para escalar con su manager.

**En el futuro:**
Podría tener acceso a una vista de supervisión con métricas de su equipo de CAMs. No está en el roadmap confirmado actualmente.

---

## Sistema (Beacon)

Actor automatizado. Ejecuta acciones sin intervención humana cuando se cumplen condiciones definidas.

**Qué hace automáticamente:**
- Detecta inactividad y mueve oportunidades a "Sin respuesta" según los días configurados
- Genera Pulse Checks con IA usando contexto de la oportunidad
- Reactiva oportunidades en espera cuando llega la fecha configurada
- Calcula días restantes del período de atribución
- Genera alertas y notificaciones según eventos del pipeline

**Qué NO hace:**
- No toma decisiones de negocio — eso siempre es del CAM
- No cierra deals ni descalifica oportunidades por su cuenta
- No contacta al cliente final

---

## Carlos

Usuario de demo hardcodeado en el prototipo actual. Representa al CAM.

No es un usuario real. Existe para que el prototipo tenga datos coherentes y una identidad concreta durante las demos. Cuando Beacon tenga backend y autenticación real, Carlos dejará de existir y cada CAM tendrá su propio perfil.
