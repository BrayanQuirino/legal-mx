# Arquitectura inicial

## Entrega 0.1
Frontend estático con catálogo de especialidades local y filtro de texto. No hay usuarios, consultas, abogados registrados ni citas reales.

## Próxima evolución
1. Definir experiencia de usuario y validación de abogados.
2. API NestJS con PostgreSQL, migraciones y pruebas.
3. Índices de búsqueda por nombre, especialidad y zona; evitar mostrar resultados sin verificación.
4. Corpus jurídico versionado por jurisdicción y fecha; recuperación con citas y auditoría.
5. Agendamiento y notificaciones transaccionales.

## Principios
Separación de responsabilidades, accesibilidad, privacidad desde diseño, registros auditables, controles de acceso, observabilidad y desarrollo incremental.
