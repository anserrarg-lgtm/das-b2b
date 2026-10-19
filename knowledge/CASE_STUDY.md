# Beacon — Case Study

## El problema
La falta de visibilidad y seguimiento de oportunidades comerciales compartidas con partners en modelos de channel sales B2B. Una vez que una oportunidad pasa al partner, el CAM pierde visibilidad del estado real del deal — y si no registra la atribución dentro de los 2 meses posteriores a la compra, pierde la comisión aunque el trabajo fue suyo.

---

## Usuarios principales
Channel Account Manager en empresa mediana de tecnología en LATAM que maneja entre 10 y más de 80 oportunidades activas simultáneas con múltiples partners.

---

## Frases textuales de entrevistas (oro para el case)

> "Las herramientas que usamos no están optimizadas para que esa búsqueda se realice de una manera rápida."
— Confirma que el problema no es habilidad del usuario sino herramientas mal diseñadas para ese flujo.

> "Si hubiese una manera donde se nos notifique, por medio de las herramientas que usamos, que ya una venta está generando atribución, en lugar de nosotros tener que buscar, sería beneficioso."
— Descripción casi literal del producto en palabras del usuario.

> "Si no se cierra en un marco de tiempo, ese dinero de la venta no nos atribuye a nosotros."
— Confirma el impacto económico directo. No es incomodidad — es dinero que se pierde.

---

## Cómo están resolviendo el problema hoy
- Revisión manual en múltiples herramientas para verificar atribución
- Seguimiento dentro del CRM para avanzar etapas
- Comunicación directa con partners (que no siempre responden)
- Tiempo estimado: 15 minutos por oportunidad en condiciones óptimas

---

## Lo que más les frustra
- Tener que verificar en más de una herramienta si una venta está atribuyendo
- La falta de comunicación de algunos partners
- El volumen de oportunidades simultáneas hace imposible el seguimiento manual con garantías

---

## Solución ideal en palabras del usuario
Una notificación automática dentro de las herramientas que ya usan que les avise cuando una venta empieza a generar atribución — sin tener que salir a buscarla. Lo resume en una palabra: **productividad**.

---

## Métricas

### Tiempo operativo ahorrado
- Seguimiento manual: ~15 min por deal
- Promedio de oportunidades activas: 70-80 simultáneas
- Tiempo total invertido en seguimiento: ~20 horas mensuales
- Con Beacon (5 min por deal): ahorro proyectado de **13.3 horas/mes**

### Impacto económico
- Oportunidades de hasta USD 400.000 anuales en riesgo por falta de visibilidad
- Pérdida de comisión si no se registra atribución dentro de 2 meses post-compra

---

## Evidencia de mercado
Plataformas PRM existentes (Impartner, Allbound, PartnerStack, Crossbeam, Zift, Salesforce PRM) confirman que el problema es real y que las empresas buscan activamente soluciones. En LATAM el problema es aún más fuerte por dependencia de comunicación informal.

---

## Herramientas utilizadas
- **Investigación y encuestas:** Tally
- **Diseño de interfaz y prototipado:** Figma
- **Desarrollo del producto:** Lovable, Claude Code
- **Stack:** React, Vercel

---

## Funcionalidades MVP

### Must (sin esto el producto no existe)
- Dashboard Kanban con 4 estados: Respondida, Esperando respuesta, Sin respuesta, Venta confirmada
- Cards con: cliente, partner, valor del deal, tipo de contrato, días restantes para atribución (badge de color), fuente de última actualización, preview de última nota
- Menú de tres puntos: enviar pulse check, agregar nota, ver detalle, poner en espera, marcar como ganada, descalificar
- Cards de resumen siempre visibles con distribución por estado
- Sistema de pulse check automático y manual al partner vía email
- Pulse check automático cuando el partner lleva X días sin actividad
- Pregunta contextual sugerida por IA según estado del deal
- Partner responde con un clic desde página standalone sin login (Deal cerrado / En negociación / Bloqueado)
- Cuando partner responde "Deal cerrado" → sistema actualiza automáticamente a "Venta confirmada"
- Centro de notificaciones con 4 tipos de alerta: pulse check enviado, partner respondió, venta confirmada, acción requerida para atribución

### Should
- Ficha de oportunidad completa: datos del deal, notas internas, historial de pulse checks
- Estados semáforo basados en actividad real
- Importación desde CSV/Excel con vista previa y mapeo de columnas
- Exportación a Excel

### Could
- Pegado inteligente con IA para extraer campos de texto desordenado del CRM
- Panel lateral embebido para Salesforce o Microsoft Teams
- Métricas de rendimiento por partner

### Won't (fuera del MVP)
- Integración en tiempo real con LYNX o MSSales
- Módulo para administradores de red de partners
- Vista propia para el partner
- Flujo de reclamo de atribución
- Sincronización bidireccional con CRMs

---

## Insights clave para el case study
- El insight central: *"No querían más seguimiento, querían más visibilidad"*
- El producto no nació de una idea — nació de escuchar que el tiempo se perdía buscando información que debería llegar sola
- La decisión de diseño más importante: priorizar visibilidad sobre acción
- El dark mode fue una decisión funcional: reduce fatiga en uso intensivo
- El vocabulario del dominio (CAM, pulse check, atribución) no se simplificó — se respetó porque los usuarios lo usan así

---

## Frases para usar en el case
- *"Comprender este ecosistema de partners fue mucho más complejo que construir la interfaz"*
- *"Sin ops en la oscuridad"*
- *"Una venta no siempre se pierde. A veces, simplemente deja de ser visible."*
- *"No querían más seguimiento, querían más visibilidad. Fue el insight que cambió todo el producto."*
