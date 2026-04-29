# Profile Manager - Entrega final

Aplicación full stack para gestionar perfil laboral, recomendaciones de vacantes
y seguimiento de postulaciones con simulación de estados.

## Características principales

- Autenticación de usuario con registro e inicio de sesión (hash de contraseña).
- Carga de CV por texto y por archivo (`PDF`, `DOCX`, `TXT`).
- Extracción mejorada de CV: habilidades, años de experiencia, educación y
  datos personales detectables.
- Perfil profesional editable y persistente.
- Recomendaciones con score de compatibilidad y explicación.
- Semáforo visual de score en home:
  - `<= 50`: rojo
  - `51 - 75`: amarillo
  - `76 - 100`: verde
- Postulación manual y asistida.
- Seguimiento automático simulado con timeline e historial:
  - estados: `Postulado`, `En revisión`, `Entrevista`, `Aceptado`,
    `Rechazado`
  - actualizaciones por temporizador + botón de simulación de empresa.

## Stack técnico

- Backend: FastAPI, SQLModel, SQLite, Pydantic.
- Frontend: React + Vite + Tailwind CSS.
- Parsing de archivos CV: `pypdf`, `python-docx`, `python-multipart`.

## Estructura del proyecto

```text
Codex/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   ├── services/
│   │   │   ├── cv_parser.py
│   │   │   └── matching.py
│   │   ├── config.py
│   │   ├── db.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── security.py
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   │   └── trackingSimulator.js
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── docs/
```

## Requisitos

- Python 3.9+ (compatible con 3.9 y superior).
- Node.js 18+ y npm.

## Configuración y ejecución

### 1) Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Verificación:

- `http://127.0.0.1:8000/health`
- `http://127.0.0.1:8000/docs`

### 2) Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Abrir:

- `http://localhost:5173`

## Flujo sugerido de uso

1. Registrarse o iniciar sesión.
2. Cargar CV (texto o archivo) y revisar extracción automática.
3. Ajustar perfil profesional.
4. Buscar ofertas y postular.
5. Monitorear avance en seguimiento simulado.

## Solución de problemas rápida

- Si login/registro queda cargando:
  - confirmar backend activo en `127.0.0.1:8000`
  - revisar que `pip install -r requirements.txt` esté completo
- Si falla carga de CV `DOCX/PDF`:
  - instalar dependencias en backend (`python-docx`, `pypdf`)
- Si seguimiento muestra resultados antiguos:
  - limpiar `localStorage` de claves `pm-tracking-sim:*`

## Estado de cumplimiento

- [x] Registro e inicio de sesión con contraseña.
- [x] Carga de CV por texto y archivo.
- [x] Extracción automática de datos del CV.
- [x] Perfil editable con persistencia.
- [x] Recomendaciones por afinidad de perfil.
- [x] Postulación manual y asistida.
- [x] Seguimiento automático simulado con historial.
- [x] Interfaz limpia y consistente para entrega.

## Documentación académica de apoyo

- `docs/backlog-producto.md`
- `docs/sprint-backlog.md`
- `docs/pruebas-aceptacion.md`
- `docs/entrega3-borrador.md`
- `docs/guion-presentacion-proyecto.md`
- `docs/matriz-cumplimiento-entregas.md`
