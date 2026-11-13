# Agenda semanal, recurrencias y acceso rápido — POC

## Experiencia
- La vista profesional inicia en el siguiente bloque completo **lunes a domingo**, sin días pasados. Las flechas permiten consultar semanas anteriores.
- Cada hora es editable individualmente; bloquear una **fila completa** abre una decisión entre **solo la semana seleccionada** y **esa hora para las próximas semanas**.
- Descansar un **día completo** pregunta si se trata de **una fecha única** o **el mismo día de la semana a partir de entonces** (por ejemplo, todos los lunes).
- Las reglas recurrentes registran una fecha de inicio en el estado de React, de modo que no alteran semanas anteriores; las citas ya agendadas se conservan para revisión.
- El cliente solo ve espacios abiertos y libres. Los bloqueos de fecha, descansos y recurrencias se reflejan en su agenda durante la misma sesión.

## Limitaciones e integraciones para producción
Todo se simula **en memoria**: al refrescar se reinician las decisiones. GitHub Pages no tiene base de datos ni sesiones server-side. Antes de operar hay que conectar:
1. Servicio de autenticación y autorización con roles del lado servidor; el acceso directo actual a clientes, abogados y administradores es **exclusivo de una demostración sin datos reales**. No debe desplegarse con expedientes de personas reales.
2. Base de datos de calendario, reglas de recurrencia (fecha inicial/final, excepciones), zona horaria y control transaccional de reservas simultáneas.
3. Notificaciones y videollamadas, con enlaces de sesión temporales y protección de datos.
4. Verificación real de identidad y cédula profesional SEP, revisión humana y controles de privacidad. Ningún perfil ficticio tiene acreditación jurídica oficial.

La navegación evita la etiqueta de marketing «Directorio demo», pero conserva un aviso sobre los perfiles sintéticos. No usar datos o testimonios inventados como si fueran auténticos.
