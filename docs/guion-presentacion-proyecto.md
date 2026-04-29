# Guion y Prompt de Presentacion - Profile Manager

## 1) Resumen ejecutivo del proyecto

**Nombre:** Profile Manager  
**Tipo:** Aplicacion web full stack para gestion de perfil laboral y postulaciones.  
**Objetivo:** Ayudar al candidato a cargar su perfil, recibir recomendaciones de vacantes con score de afinidad, postularse (manual/asistida/automatica) y hacer seguimiento del proceso.

## 2) Problema que resuelve

- El candidato suele tener informacion dispersa de su perfil.
- Las vacantes no siempre se priorizan por compatibilidad real.
- El seguimiento del proceso de seleccion es poco claro.
- Hay poco apoyo para automatizar postulaciones sin perder control.

## 3) Propuesta de valor

- Extrae informacion del CV (texto o archivo) para crear un perfil base.
- Calcula recomendaciones con explicacion del score.
- Permite 3 formas de postulacion: manual, asistida y automatica.
- Ofrece tablero de seguimiento con timeline e historial de estados.
- Presenta una interfaz simple, limpia y centrada en decisiones del usuario.

## 4) Arquitectura y tecnologia

### Frontend
- React + Vite + Tailwind.
- Vistas principales: `Home`, `Perfil`, `Postulaciones`, `Seguimiento`.
- Cliente API centralizado en `frontend/src/api/client.js`.
- Persistencia local para sesion y simulacion:
  - `profile-manager-user`
  - `pm-tracking-sim:*`

### Backend
- FastAPI + SQLModel + SQLite.
- Endpoints REST por modulos:
  - Usuarios (`/api/users`)
  - Perfil (`/api/profile`)
  - Vacantes y recomendaciones (`/api/jobs`)
  - Postulaciones y automatizacion (`/api/applications`)
  - Dashboard (`/api/home`)
- CORS configurable y endpoint de salud `/health`.

## 4.1) Descripcion breve de tecnologias usadas

- **React:** construye la interfaz por componentes reutilizables y estados.
- **Vite:** entorno de desarrollo y build rapido para frontend.
- **Tailwind CSS:** estilos utilitarios para UI limpia y consistente.
- **FastAPI:** framework backend para exponer API REST tipada y documentada.
- **SQLModel/SQLAlchemy:** mapeo de modelos Python a tablas SQLite.
- **SQLite:** base de datos local, ideal para demo y entrega academica.
- **Pydantic:** validacion de payloads y contratos de datos (schemas).
- **python-docx / pypdf / python-multipart:** soporte para carga y lectura de CV en DOCX/PDF/TXT.
- **localStorage (frontend):** persistencia de sesion y estado del simulador.

## 5) Funcionalidades completas (desmenuzadas)

### 5.1 Autenticacion
- Registro con `nombre`, `correo`, `contrasena`.
- Login por correo/contrasena.
- Contraseñas con hash + salt.
- Compatibilidad con usuarios antiguos (migracion de hash en primer login).

### 5.2 Perfil y CV
- Carga de CV por:
  - Texto pegado.
  - Archivo (`.txt`, `.pdf`, `.docx`).
- Extraccion automatica de:
  - Habilidades detectadas por palabras clave.
  - Anos de experiencia (regex sobre "X anos").
  - Nivel educativo (tecnico, pregrado, maestria, etc.).
  - Datos personales detectables (correo, telefono, nombre/ciudad cuando estan etiquetados).
- Edicion manual posterior del perfil para afinar resultados.

### 5.3 Recomendaciones de vacantes
- Seed de vacantes de multiples perfiles:
  - Tecnologia, cocina, arquitectura, ventas, administrativo,
    negociacion internacional.
- Score por superposicion de habilidades.
- Bonus por afinidad de perfil/tag (ej. chef, arquitecto, negociador).
- Explicacion textual del por que del score.
- Semaforo visual de score:
  - 0-50 rojo
  - 51-75 amarillo
  - 76-100 verde

### 5.4 Postulaciones
- **Manual:** el usuario decide vacante puntual.
- **Asistida:** crea postulaciones sobre top recomendaciones.
- **Automatica:** configurable por limites/filtros/frecuencia.
- Prevencion de duplicados por usuario + vacante.

### 5.5 Seguimiento
- Simulacion automatica de estados cada cierto tiempo.
- Evento manual "Simular actualizacion de empresa".
- Estados visibles:
  - Postulado
  - En revision
  - Entrevista
  - Aceptado
  - Rechazado
- Timeline compacta + historial expandible por postulacion.

### 5.6 Dashboard Home
- Total de postulaciones.
- Progreso porcentual.
- Conteo por estado.
- Recomendaciones destacadas con score y razon.

## 6) Flujo de usuario end-to-end (demo sugerida)

1. Registro/inicio de sesion.
2. Carga de CV (texto o PDF/DOCX/TXT).
3. Revisar perfil extraido y corregir manualmente.
4. Ir a postulaciones, aplicar manual o asistida.
5. Guardar configuracion automatica y ejecutar corrida.
6. Ver Home: metricas y top recomendaciones.
7. Ir a seguimiento, simular actualizacion y explicar timeline.

## 7) Decisiones de diseno importantes para defender

- Separacion frontend/backend para escalabilidad.
- API REST modular por dominio.
- Parsing de CV con heuristicas simples pero explicables.
- Matching transparente (score + razon), no caja negra.
- Simulacion de seguimiento para demostrar proceso sin depender de integraciones externas.
- UX minimalista para facilidad de uso y evaluacion academica.

## 7.1) Lo mas importante del codigo (explicable en sustentacion)

### A) Como se obtiene el score de recomendacion

El score se calcula en backend en el servicio de matching:

1. Se toman habilidades requeridas de la vacante (`required_skills_csv`).
2. Se comparan contra habilidades del perfil del usuario (`profile.skills_csv`).
3. Se calcula un score base por superposicion:
   - `score = (habilidades_coincidentes / habilidades_requeridas) * 100`
4. Si hay afinidad de perfil por etiquetas (ej. chef, arquitecto, negociador),
   se aplica un bonus de hasta 30 puntos.
5. El score final se limita a 100.
6. Se genera una razon textual para explicar coincidencias y faltantes.

### B) Extraccion automatica de CV

La extraccion se realiza en backend (`cv_parser.py`) con reglas claras:

- Regex para email, telefono y anos de experiencia.
- Deteccion de nivel educativo por palabras clave.
- Deteccion de habilidades por diccionario controlado.
- Construccion de resumen inicial del perfil para que el usuario luego lo edite.

### C) Flujo de postulacion multiestrategia

- **Manual:** postula a una vacante puntual.
- **Asistida:** crea postulaciones sobre recomendaciones top.
- **Automatica:** usa configuracion de limites/filtros y ejecuta lote.
- Todas previenen duplicados por `user_id + job_id`.

### D) Seguimiento automatico simulado

- El frontend ejecuta ticks periodicos y eventos manuales.
- Cada tick avanza estados con probabilidades (no lineal).
- Se guarda historial por postulacion en `localStorage` para timeline.

## 8) Limitaciones actuales (honestas)

- No hay autenticacion con JWT/sesiones server-side.
- Extraccion de CV basada en reglas; no usa NLP avanzado.
- Seguimiento en parte simulado (no conectado a ATS real).
- Base SQLite local, sin despliegue cloud por defecto.

## 9) Mejora futura recomendada

- JWT + refresh tokens y roles.
- Motor de matching hibrido (reglas + embeddings).
- Integracion con portales reales (LinkedIn/Indeed/API externa).
- Reportes historicos por usuario y conversion por etapa.
- Despliegue CI/CD con entorno staging/produccion.

## 10) Prompt listo para generar presentacion de apoyo

Copia y pega este prompt en ChatGPT/Gemini/Claude/Canva Magic Design:

```text
Actua como arquitecto de software y consultor de producto. 
Necesito una presentacion profesional en espanol (12-14 diapositivas) 
sobre un proyecto llamado "Profile Manager", una web full stack de gestion de perfil laboral.

Contexto del sistema:
- Frontend: React + Vite + Tailwind.
- Backend: FastAPI + SQLModel + SQLite.
- Modulos: autenticacion, perfil/CV, recomendaciones, postulaciones, seguimiento, dashboard.
- Registro/login con hash de contrasena.
- Carga de CV por texto o archivo (PDF, DOCX, TXT).
- Extraccion automatica de habilidades, anos de experiencia, educacion y datos personales detectables.
- Recomendaciones con score y explicacion.
- Semaforo de score: rojo (<=50), amarillo (51-75), verde (76-100).
- Postulacion manual, asistida y automatica configurable.
- Seguimiento con timeline e historial, estados: Postulado, En revision, Entrevista, Aceptado, Rechazado.
- Dashboard con metricas de postulaciones y recomendaciones destacadas.

Quiero que la presentacion incluya:
1) problema y oportunidad,
2) propuesta de valor,
3) arquitectura tecnica,
4) demostracion del flujo end-to-end,
5) funcionalidades clave por modulo,
6) decisiones tecnicas y trade-offs,
7) resultados esperados e impacto,
8) limitaciones actuales,
9) roadmap de mejoras,
10) cierre con mensaje para jurado/profesor.

Formato de salida:
- Para cada diapositiva: titulo, objetivo, 3-5 bullets y nota del expositor (speaker notes).
- Incluir sugerencia visual (tipo de grafico/diagrama/mockup) por diapositiva.
- Tono: academico-profesional, claro y convincente.
- Duracion total estimada: 8-10 minutos.
```

## 11) Mini script oral (60 segundos)

"Profile Manager es una plataforma que centraliza el ciclo del candidato: desde la extraccion del perfil con CV, hasta la recomendacion inteligente de vacantes, postulacion multiestrategia y seguimiento del proceso. Tecnologicamente usamos React en frontend y FastAPI en backend, con una API modular y base de datos local para entrega academica. El diferencial esta en la trazabilidad: cada recomendacion tiene score explicable y cada postulacion tiene evolucion visible en timeline. El resultado es una experiencia clara, automatizable y defendible tecnicamente."
