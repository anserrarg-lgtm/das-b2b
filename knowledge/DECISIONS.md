# Product Decisions

> Registro de decisiones históricas importantes que no aparecen en el código.
> Este documento explica el por qué detrás de cada decisión, no solo el qué.
> Es el documento más valioso a largo plazo y el más difícil de reconstruir.
> Se actualiza cada vez que se toma una decisión importante.

---

## De Orbit a Beacon

**Decisión:** cambiar el nombre del producto de Orbit a Beacon.

**Contexto:** el nombre Orbit venía de una imagen concreta — el modelo de ventas por canal como una órbita de tres ejes: el asesor, el CAM y el partner. Era conceptualmente preciso pero demasiado técnico y poco memorable.

**Por qué Beacon:** el nombre emergió con un storytelling más claro. Un beacon es un faro — algo que ilumina lo que estaba en la oscuridad. Conecta directamente con el tagline "Sin ops en la oscuridad" y con la propuesta de valor central del producto: visibilidad donde antes había puntos ciegos.

**Consecuencia:** el repositorio conserva el nombre `orbit-app` por decisión práctica de no renombrarlo durante el desarrollo activo. No afecta al producto.

---

## El producto está centrado en el CAM, no en el partner

**Decisión:** diseñar Beacon exclusivamente para el CAM. El partner no tiene acceso al sistema.

**Contexto:** se consideró dar acceso al partner — un panel donde pudiera actualizar el estado de sus deals directamente. Se descartó.

**Por qué:** el partner no tiene incentivo para adoptar una herramienta nueva que no fue diseñada para él y que le agrega trabajo. Obligarlo a aprender un sistema externo habría creado fricción en el lado del actor sobre el que menos control tenemos. La decisión fue diseñar desde el lado del CAM y que el partner solo reciba un email y responda. Cero fricción para el partner.

---

## Pulse Checks en lugar de alertas internas

**Decisión:** el mecanismo central del producto es el Pulse Check — un mensaje enviado al partner — y no un sistema de recordatorios internos para el CAM.

**Contexto:** una alternativa considerada fue construir alertas internas que le recordaran al CAM cuándo hacer seguimiento.

**Por qué se descartó:** los recordatorios no resuelven el problema. El CAM sigue teniendo que escribir el mensaje manualmente. El Pulse Check automatiza el acto de contactar, no solo el recordatorio. Es la diferencia entre un post-it y una llamada hecha.

---

## MVP sin backend

**Decisión:** el prototipo es frontend puro con datos mock. No hay backend.

**Por qué:** decisión pragmática para esta etapa. El objetivo del prototipo es demostrar el valor del producto, no construir infraestructura. El mock data permite mostrar todas las funcionalidades sin depender de APIs ni bases de datos. El backend viene cuando el producto valide su propuesta de valor con usuarios reales.

**Implicación técnica:** el estado vive en React Context en memoria. Se pierde al recargar la página. Esto es intencional para el demo — cada recarga devuelve el estado al punto de partida, lo que permite repetir la demo sin resetear datos manualmente.

---

## Sin integraciones CRM desde el inicio

**Decisión:** no integrar Salesforce, HubSpot ni Dynamics 365 en el MVP. La importación es por Excel o manual.

**Por qué:** las integraciones CRM requieren acceso a credenciales corporativas, procesos de aprobación de IT y ciclos de implementación largos. El MVP elige Excel como puente — universal, sin permisos especiales, inmediato. Cualquier CAM puede usarlo desde el día uno. Las integraciones vienen cuando el producto tenga usuarios reales con necesidad demostrada.

---

## Desktop-only

**Decisión:** Beacon está diseñado exclusivamente para pantallas de 1280px o más. Hay un fallback para pantallas pequeñas que muestra un mensaje explicativo.

**Por qué:** el CAM gestiona su pipeline desde su computador, no desde el celular. Diseñar para mobile habría diluido la experiencia de la vista principal — el pipeline Kanban con múltiples columnas no funciona en pantallas pequeñas. La decisión fue optimizar para el contexto de uso real.

---

## Resend como servicio de email planificado

**Decisión:** cuando el producto pase a producción real, el envío de emails se conectará a Resend.

**Por qué:** en el demo el envío está simulado — Beacon registra el Pulse Check en el estado local pero no realiza ninguna llamada externa. La decisión de usar Resend fue tomada desde el inicio para que el paso de demo a producción sea lo más directo posible. La arquitectura ya contempla esta conexión.

---

## Beacon como proyecto de portfolio con vocación real

**Decisión:** documentar y construir Beacon como si fuera a ser un producto real, aunque nació como proyecto de portfolio.

**Por qué:** el objetivo del portfolio es demostrar que una diseñadora puede entender y resolver problemas de negocio complejos, no solo construir interfaces. Beacon fue diseñado con esa intención — y documentado con la misma rigurosidad que tendría un producto real, para que pueda tener vida más allá del contexto en el que fue creado.

Esta base de conocimiento existe precisamente por esa razón.
