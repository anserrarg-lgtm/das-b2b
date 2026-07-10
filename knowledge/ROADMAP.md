# Roadmap

> Lista de funcionalidades planificadas para cuando Beacon pase de prototipo a producto real.
> Solo incluye lo que está confirmado o tiene intención clara. No incluye ideas especulativas.
> Se actualiza cuando cambian las prioridades o se confirman nuevas funcionalidades.

---

## Estado actual

Beacon es un prototipo funcional frontend-only con datos mock. Demuestra el valor del producto pero no está conectado a servicios reales.

---

## Próximo paso crítico

### Email real con Resend
**Qué es:** conectar el envío de Pulse Checks a Resend para que los emails lleguen realmente al partner.
**Por qué es prioritario:** es el paso que convierte el prototipo en un producto funcional. Sin esto, Beacon no puede usarse en producción real.
**Estado:** arquitectura preparada. Pendiente de implementación.

---

## Funcionalidades planificadas

### WhatsApp Business API
Canal alternativo para enviar Pulse Checks. Muchos partners responden más rápido por WhatsApp que por email. Marcado como "Próximamente" en la UI actual.

### Integración CRM
Conexión bidireccional con Salesforce, HubSpot y Dynamics 365.
- Importar oportunidades directamente desde el CRM
- Actualizar estados en el CRM cuando cambian en Beacon

Marcado como "Próximamente" en el modal de importación actual.

### Backend y persistencia real
Actualmente el estado vive en memoria y se pierde al recargar. Se necesita:
- Base de datos para persistir oportunidades, conversaciones y configuración
- API backend que sirva los datos
- Autenticación de usuarios

### Multiusuario
Soporte para múltiples CAMs en la misma organización.
- Cada CAM con su propio perfil y pipeline
- Vista de manager con métricas del equipo

Actualmente solo existe el usuario demo "Carlos".

### Detección automática de confirmaciones
Usar IA para detectar en los emails entrantes cuando un partner confirma el cierre de un deal, sin que el CAM tenga que registrarlo manualmente.

---

## Lo que NO está en el roadmap

- Aplicación mobile — Beacon es desktop-only por diseño. Ver DECISIONS.md.
- Acceso para partners — descartado por diseño. Ver DECISIONS.md.
- Vista pública del pipeline — no tiene caso de uso claro todavía.
