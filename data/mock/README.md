# Datos ficticios para pruebas

Estos archivos contienen **40 abogados y 100 usuarios completamente sintéticos**. No son perfiles auténticos, no tienen cédula profesional, datos de contacto reales, reseñas ni citas.

- `lawyers.json`: atributos para probar tarjetas, geografía, especialidades, honorarios y modalidad; `identity_verified=false`, `license_verified=false`, `profile_status=synthetic_test_only`.
- `users.json`: registros ficticios con correo reservado bajo `example.invalid`, sin contraseña, teléfono, identidad oficial, consentimiento o descripción de casos.

**No publicarlos como profesionales existentes**, no indexar sus fichas para SEO, no mandar notificaciones ni usarlos en entornos de producción. Crear usuarios reales únicamente con consentimiento y almacenamiento privado. La validación de cédulas debe hacerse por un procedimiento específico con fuentes autorizadas.

Los JSON son fixtures estáticos para las pruebas. Los registros reales deberán persistirse en una base de datos protegida. Las rutas públicas de GitHub exponen estos datos de prueba y eso es deliberado.
