# Modelo de datos (propuesta)

El SQL de `apps/api/migrations/001_initial.sql` define jurisdicciones, áreas legales, perfiles, verificación de cédula, relaciones y fuentes oficiales. No contiene abogados ficticios ni solicitudes reales.

**Antes de producción:** configurar PostgreSQL de forma privada, añadir autenticación, autorización a nivel de registro, validación documental de cédula profesional, consentimiento y aviso de privacidad, auditoría, protección contra scraping y migraciones versionadas con rollback.

Los perfiles `pending` o `suspended` nunca deben mostrarse en resultados públicos. La existencia de una cédula no sustituye la verificación de identidad, facultades ni la calidad del servicio.
