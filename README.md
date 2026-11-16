# HuellaVet 🐾

Plataforma de atención veterinaria para México, inspirada en marketplaces de profesionales y desarrollada como prueba de concepto en React + TypeScript + Vite.

## Experiencia actual

- Directorio de 40 perfiles veterinarios **ficticios**, con filtros de especialidad, especie, precio, modalidad y zona.
- Mapa OpenStreetMap/Leaflet con pines de huellas y radio en kilómetros; las coordenadas son simuladas.
- Tres vistas: **Tutores**, **Veterinarios**, **Administración** (acceso directo de pruebas, NO autenticación real).
- 100 tutores, 100 mascotas y 25 consultas sintéticas vinculadas a cinco agendas de veterinarios.
- Reserva con paciente animal, motivo de atención, horario y modalidad; gestión de citas pendientes, confirmación y cancelación.
- Agenda de siete columnas y 24 filas con selección tipo Excel, arrastre por celdas/encabezados, bloqueo masivo y recurrencias.
- Panel profesional para configurar modalidad, horario, días de atención, precio y ubicación ficticia.
- Validación de profesión y cédula MVZ **simulada exclusivamente**. Ninguna persona ni clínica fue verificada.

## Tecnología

React, TypeScript, Vite, Vitest, CSS, Leaflet, OpenStreetMap, Lucide. Sitio estático en GitHub Pages.

```bash
npm install
npm run test
npm run build
npm run dev
```

## Para producción

GitHub Pages no ofrece backend de datos ni control de acceso. Antes de admitir usuarios reales, integrar:
1. Inicio de sesión por roles (tutores, veterinarios, administración) con autorización verificada en el servidor.
2. Base de datos con mascotas, consultas, clínicas, horarios y registros de recurrencia persistentes; protección de información personal y clínica.
3. Control transaccional para evitar reservas simultáneas, notificaciones, cancelaciones y recordatorios.
4. Comprobación oficial de cédula y profesión veterinaria, identidad y revisión manual documentada.
5. Servicios para videollamadas cuando sea apropiado, sin reemplazar exámenes clínicos presenciales requeridos.
6. Políticas de privacidad, protección de datos y mecanismos de soporte y atención de urgencias.

**Importante:** todos los datos actuales son inventados y nunca deben confundirse con veterinarios acreditados, consultas, reseñas ni clínicas reales. Los cambios realizados en la POC se pierden al recargar. Se aplicó noindex a esta demostración.

El proyecto conserva documentos históricos de Legal MX como referencia de migración; esos documentos no describen el producto veterinario vigente.
