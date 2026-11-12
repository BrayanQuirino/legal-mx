# POC — tres portales y verificación jurídica

## Estado y restricciones
La POC permite explorar tres vistas (usuarios, abogados y administración), acceso/registro simulado, modalidad de consulta (videollamada, despacho presencial, ambas) y pasos ilustrativos de validación profesional.

**NO hay autenticación, autorización, alta de cuentas, citas, videollamadas, identificación oficial, verificación profesional ni conservación de datos.** La vista administrativa NO cuenta con protecciones reales de acceso. El botón de Google está deshabilitado. No usar datos reales.

## Flujo previsto de validación
1. Mostrar aviso de privacidad integral antes de recabar datos; identificar al responsable, finalidades, fundamento y derechos ARCO. Justificar los datos requeridos, seguridad, plazos de conservación y transferencias.
2. Verificar identidad del profesionista (proveedor KYC y/o procedimiento manual adecuado); no tratar biometría si no es necesaria.
3. Consultar la cédula profesional en la fuente oficial SEP/Registro Nacional de Profesionistas, cotejando número, nombre, grado y profesión. Un resultado coincidente no acredita por sí solo la identidad ni la facultad para toda actuación.
4. Verificar requisitos adicionales por actividad, materia y jurisdicción, según corresponda, particularmente CDMX y Edomex.
5. Revisar discrepancias manualmente, conservar bitácora, otorgar aprobación únicamente tras evidencia verificable y permitir suspensión, rectificación o revocación.
6. Separar estado POC (nunca verificado) y estado real del backend; jamás publicar un badge «verificado» basado en estados del navegador.

## Marco normativo inicial para revisión profesional
- Ley Federal de Protección de Datos Personales en Posesión de los Particulares, publicada 20-mar-2025, con modificaciones posteriores. https://www.ordenjuridico.gob.mx/Documentos/Federal/html/wo125102.html
- Registro Nacional de Profesionistas / Secretaría de Educación Pública. https://www.gob.mx/cedulaprofesional
- Revisar legislación profesional estatal, competencia de representación judicial y requisitos de abogados ante los tribunales correspondientes, con asesor jurídico en el despliegue real.

Este diseño **no asegura por sí solo el cumplimiento legal**. Antes de lanzamiento real, realizar evaluación jurídica y de privacidad, incluyendo evaluación de proveedores y contratos de encargo.

## Integraciones pendientes
- Identidad Google: OAuth/OIDC, backend seguro con sesiones HttpOnly Secure SameSite, secretos exclusivamente del lado servidor, control antisuplantación y protección CSRF.
- Registro: NestJS + PostgreSQL; validación de correo; roles RBAC en servidor; MFA para administración.
- Identificación: proveedor KYC autorizado/apropiado y procedimiento de revisión humana; almacenamiento cifrado y acceso mínimo.
- SEP: validar disponibilidad de consulta automatizada oficial o implementar revisión documental manual trazable. NO suponer API pública.
- Videollamadas: infraestructura privada de reuniones, enlaces temporales, consentimiento, agenda y cancelaciones. No grabar por defecto.
- Datos sintéticos: no colocar fixtures de abogados como perfiles reales en producción.

## Cómo probar
Entrar desde «Iniciar sesión / Registrarse». Elegir rol. Para explorar la pantalla, utilizar un correo reservado con final `@example.test` y la palabra `DEMO` como clave ilustrativa. No usar contraseñas reales. El estado solo vive en memoria del navegador y desaparece al recargar.
