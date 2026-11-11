# Legal MX

Plataforma LegalTech para conectar personas con profesionales del derecho en México y brindar orientación jurídica con fuentes verificables.

## Estado del proyecto
MVP 0.1 — estructura inicial en desarrollo.

## Objetivos
- Búsqueda de profesionales por especialidad y ubicación.
- Perfiles profesionales y solicitudes de consulta.
- Asistente de orientación jurídica para Ciudad de México y Estado de México.
- Referencias normativas verificables, fecha de vigencia y advertencias sobre limitaciones de la IA.

## Tecnología
- Web: React, TypeScript, Vite y CSS modular.
- API futura: Node.js y NestJS.
- Persistencia futura: PostgreSQL.
- Asistente futuro: búsqueda documental (RAG), recuperación de fuentes oficiales y supervisión editorial.

## Estructura
```
apps/web/                  Frontend
apps/api/                  Contrato y futura API
packages/                  Componentes y tipos compartidos
data/legal-sources/        Registro de fuentes oficiales
docs/                      Arquitectura y decisiones
```

## Flujo de ramas
- `main`: producción
- `test`: pruebas integradas
- `develop_brayan`: desarrollo activo

## Desarrollo local
Requiere Node.js 22 o superior.

```bash
npm install
npm run dev
```

Abrir la URL que indique Vite. La aplicación es todavía un prototipo; no proporciona asesoría jurídica profesional.

## Seguridad y privacidad
No colocar secretos en el frontend ni almacenar datos personales sensibles en archivos JSON públicos. Antes de activar usuarios, consultas o expedientes, implementar autenticación, controles de acceso y políticas de privacidad.

## Licencia
Pendiente de definición. No se concede licencia de uso adicional por el momento.
