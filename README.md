# Profile Manager - Entrega corregida

Proyecto full stack listo para entrega académica, con separación clara frontend/backend y cobertura de los requisitos funcionales de la plantilla.

## Estructura del proyecto

```text
Codex/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   ├── services/
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
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── docs/
    ├── backlog-producto.md
    ├── sprint-backlog.md
    └── pruebas-aceptacion.md
```

## Requisitos técnicos

- Python 3.11+
- Node.js 18+ y npm

## Ejecución backend

1. Ir a la carpeta backend:
   ```bash
   cd backend
   ```
2. Crear entorno virtual:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
3. Instalar dependencias:
   ```bash
   pip install -r requirements.txt
   ```
4. Ejecutar API:
   ```bash
   uvicorn main:app --reload
   ```
5. Verificar salud:
   - `http://localhost:8000/health`
   - Swagger: `http://localhost:8000/docs`

## Ejecución frontend

1. Abrir otra terminal e ir a frontend:
   ```bash
   cd frontend
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Ejecutar aplicación:
   ```bash
   npm run dev
   ```
4. Abrir:
   - `http://localhost:5173`

## Flujo funcional esperado

1. Crear cuenta (registro).
2. Cargar CV en texto y extraer habilidades.
3. Editar perfil profesional.
4. Revisar recomendaciones por score.
5. Ejecutar postulación manual/asistida/automática.
6. Gestionar estados en seguimiento.
7. Revisar métricas en Home.

## Checklist de cumplimiento

- [x] Registro de usuario.
- [x] Carga de CV y extracción inicial de habilidades.
- [x] Perfil editable y persistido.
- [x] Recomendaciones de vacantes con score y explicación.
- [x] Postulación manual y asistida.
- [x] Configuración y ejecución de postulación automática.
- [x] Seguimiento por estados.
- [x] Home con métricas y resumen.
- [x] Backlog de producto y sprint backlog.
- [x] Pruebas de aceptación documentadas.
