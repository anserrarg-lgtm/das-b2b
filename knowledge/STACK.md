# Stack

> Describe las tecnologías principales de Beacon y las decisiones detrás de cada elección.
> No es documentación técnica exhaustiva — es contexto suficiente para entender el proyecto.
> Para decisiones de arquitectura más profundas ver DECISIONS.md.

---

## Frontend

**React 19 + Vite**
SPA frontend puro. No hay backend. Todo el estado vive en memoria a través de React Context. Esta es una decisión intencional para el prototipo — ver DECISIONS.md.

**React Router DOM v7**
Navegación del lado del cliente. Las rutas principales son:
- `/` — Landing page
- `/pipeline` — Pipeline principal (vista del CAM)
- `/oportunidad/:id` — Ficha de oportunidad
- `/partners` — Vista de partners
- `/notificaciones` — Centro de notificaciones
- `/nuevas` — Oportunidades recién cargadas
- `/perfil` — Perfil del CAM
- `/historial` — Historial de oportunidades

---

## UI y componentes

**Radix UI**
Componentes primitivos accesibles (Dialog, DropdownMenu, Switch, Tooltip). Proporciona comportamiento accesible sin imponer estilos.

**Lucide React**
Librería de iconos. Usada en toda la aplicación.

**Styling**
El styling es casi 100% inline styles en objetos JSX. Tailwind CSS está instalado como dependencia pero su uso es mínimo. Esta decisión fue práctica — permite control granular sobre cada elemento sin depender de clases predefinidas.

---

## Inteligencia Artificial

**Anthropic API — Claude Sonnet**
Usada para dos propósitos:
1. Generación de mensajes de Pulse Check con contexto de la oportunidad
2. Generación de resúmenes de escalación para el manager

La llamada se hace directamente desde el cliente en el prototipo. En producción debería hacerse desde un backend para no exponer la API key. El modelo usado es `claude-sonnet-4-6`.

---

## Datos

**Mock data**
Todos los datos son ficticios y viven en `src/data/mockData.js`. Incluye 30 oportunidades distribuidas entre todos los estados, con conversaciones de Pulse Check realistas.

El estado se pierde al recargar la página. Esto es intencional para el demo.

**SheetJS (xlsx)**
Importación y exportación de archivos Excel. Permite al CAM cargar oportunidades desde una hoja de cálculo y exportar su pipeline.

---

## Infraestructura

**Vercel**
Deploy automático conectado al repositorio de GitHub. Cada push a `main` genera un nuevo deploy.

**GitHub**
Repositorio: `github.com/anserrarg-lgtm/das-b2b`
El nombre del repositorio es `orbit-app` localmente — ver DECISIONS.md para el contexto del cambio de nombre.

---

## Estructura del proyecto

```
src/
├── App.jsx                      — Router raíz + layout shell
├── main.jsx                     — Punto de entrada
├── index.css                    — Estilos globales mínimos
├── context/
│   └── AppContext.jsx           — Estado global + toda la lógica de negocio
├── data/
│   └── mockData.js              — Datos mock + constantes (ESTADOS, ESTADO_CONFIG)
├── components/
│   ├── Pipeline/
│   │   ├── PipelineBoard.jsx    — Vista principal del pipeline
│   │   └── OpportunityCard.jsx  — Card de oportunidad en el kanban
│   ├── OpportunityDetail.jsx    — Ficha de oportunidad + chat de Pulse Check
│   ├── Sidebar.jsx              — Navegación lateral
│   └── Toggle.jsx               — Componente toggle reutilizable
└── pages/
    ├── LandingPage.jsx          — Landing page de marketing
    ├── NotificationsPage.jsx    — Centro de notificaciones
    ├── PartnersPage.jsx         — Vista de partners
    ├── NuevasPage.jsx           — Oportunidades recién cargadas
    └── ProfilePage.jsx          — Perfil del CAM y configuración
```

---

## Lo que viene en el stack

Cuando Beacon pase a producción real se necesitará:
- Backend (Node.js o similar) para persistencia y autenticación
- Base de datos (PostgreSQL o similar)
- Resend para envío real de emails
- Las llamadas a la API de Anthropic deberán moverse al backend

Ver ROADMAP.md para el detalle completo.
