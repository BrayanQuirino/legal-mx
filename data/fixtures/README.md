# Datos sintéticos para pruebas

Carpeta de **fixtures**, nunca un directorio auténtico. Los datos están inventados: 40 perfiles profesionales y 100 usuarios simulados. Son útiles para probar filtros, búsquedas, paginación, accesibilidad, diseño, gestión de escenarios y futuros endpoints.

## Archivos
- `lawyers.synthetic.json`: 40 perfiles de abogacía de prueba; cédulas y verificación siempre nulas/no verificadas.
- `users.synthetic.json`: 100 usuarios ficticios; correos en `example.test`, sin teléfono ni dirección exacta.

## Reglas obligatorias
1. Jamás publicarlos como personas reales, profesionales verificados o testimonios auténticos.
2. Nunca mostrar perfiles ficticios en páginas indexables por Google. La app de producción **no** debe importar esta carpeta.
3. Usar en tests, entornos locales, y staging con etiqueta visible «DATOS DE PRUEBA» y acceso restringido.
4. No generar reseñas o citas aparentando ser verificadas, ni cédulas profesionales falsas.
5. No mezclar fixtures con datos personales verdaderos.
6. Para conectar con PostgreSQL, implementar seeder local/staging con guardia `NODE_ENV !== 'production'`, y separar tablas y permisos de la experiencia pública.

Los precios, años de experiencia y preferencias son parámetros arbitrarios para validar interfaz, **no** precios reales ni datos de mercado.

## Ideas de pruebas
- Filtrar por 2 jurisdicciones y 16 municipios/alcaldías.
- Buscar por las 6 especialidades.
- Filtros de modalidad de consulta y rangos de precio.
- Paginación para 40 profesionales y 100 usuarios.
- Validar privacidad: cédula null, ausencia de teléfono y no indexación.
- Simular embudos y reservas sin enviar mensajes ni cobrar.
