# Matriz de cumplimiento - Entrega 1 y Entrega 3

Este documento resume el cumplimiento de requisitos solicitados en las entregas
del proyecto y su evidencia dentro del repositorio.

## Entrega 1

| Requisito | Estado | Evidencia en repo |
| --- | --- | --- |
| Backlog de producto | Cumple | `docs/backlog-producto.md` |
| Sprint backlog | Cumple | `docs/sprint-backlog.md` |
| Casos/pruebas de aceptación | Cumple | `docs/pruebas-aceptacion.md` |
| PoC funcional web (frontend + backend) | Cumple | `frontend/`, `backend/`, `README.md` |
| Flujo básico usuario-perfil-vacantes | Cumple | `frontend/src/pages/`, `backend/app/routes/` |

## Entrega 3

| Requisito | Estado | Evidencia en repo |
| --- | --- | --- |
| Producto funcional end-to-end | Cumple | `backend/main.py`, `frontend/src/App.jsx` |
| Arquitectura documentada | Cumple | `README.md`, `docs/entrega3-borrador.md` |
| Principios/patrones de diseño analizados | Cumple | `docs/entrega3-borrador.md` |
| Funcionalidades demostrables (min. 3 HU) | Cumple | `docs/entrega3-borrador.md`, `frontend/src/pages/` |
| Recomendaciones con score explicable | Cumple | `backend/app/services/matching.py`, `backend/app/routes/jobs.py` |
| Extracción de CV por texto y archivo | Cumple | `backend/app/services/cv_parser.py`, `backend/app/routes/profile.py` |
| Postulación manual/asistida/automática | Cumple | `backend/app/routes/applications.py`, `frontend/src/pages/PostulacionesPage.jsx` |
| Seguimiento con timeline y simulación | Cumple | `frontend/src/pages/SeguimientoPage.jsx`, `frontend/src/utils/trackingSimulator.js` |

## Notas de coherencia para sustentación

- Repositorio oficial del proyecto:
  - <https://github.com/jjacevedo/profile-manager-ingenieria-de-software>
- En backend los estados persistidos de `ApplicationStatus` son:
  - `Postulado`, `En revisión`, `Entrevista`, `Rechazado`.
- En frontend existe estado **simulado** `Aceptado` para la demo de seguimiento:
  - no se persiste actualmente en la tabla `Application`.

## Pendientes recomendados (opcional)

- Adjuntar evidencias visuales de ceremonias ágiles (planning, retro, dailies).
- Adjuntar capturas de tableros/board de sprint con fecha.
- Mantener consistentes las cifras de métricas entre documento y demo.
