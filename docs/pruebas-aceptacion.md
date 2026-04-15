# Pruebas de aceptación

## Caso 1: Onboarding y creación de cuenta
- **Dado** que el usuario no tiene cuenta.
- **Cuando** completa nombre y correo válidos y envía el formulario.
- **Entonces** el sistema crea la cuenta y habilita el acceso a las vistas.

## Caso 2: Carga de CV y extracción de habilidades
- **Dado** que existe un usuario registrado.
- **Cuando** pega su CV en texto y pulsa "Extraer habilidades".
- **Entonces** el sistema crea/actualiza perfil con resumen y habilidades detectadas.

## Caso 3: Recomendaciones explicables
- **Dado** un perfil con habilidades cargadas.
- **Cuando** ingresa a la vista de postulaciones.
- **Entonces** visualiza vacantes recomendadas con score y explicación de coincidencia.

## Caso 4: Postulación manual
- **Dado** que hay vacantes recomendadas.
- **Cuando** pulsa "Postular manualmente" en una vacante.
- **Entonces** se registra una nueva postulación en estado `Postulado`.

## Caso 5: Postulación asistida
- **Dado** que hay vacantes sin postular.
- **Cuando** ejecuta "Postulación asistida".
- **Entonces** se crean múltiples postulaciones (hasta el límite solicitado).

## Caso 6: Configuración de automatización
- **Dado** que el usuario define mínimo/máximo/filtros.
- **Cuando** guarda la configuración automática y ejecuta automatización.
- **Entonces** se crean postulaciones automáticas respetando la configuración.

## Caso 7: Seguimiento y cambio de estado
- **Dado** que existen postulaciones.
- **Cuando** cambia un estado a `En revisión` o `Entrevista`.
- **Entonces** el estado queda persistido y visible en Home y Seguimiento.
