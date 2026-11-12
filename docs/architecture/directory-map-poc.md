# Mapa de abogados: POC

Se añadieron coordenadas sintéticas a los 40 abogados en `data/fixtures/lawyers.synthetic.json` y una vista `Lista / Mapa` en el directorio.

## Campos añadidos
`geo.latitude`, `geo.longitude`, `geo.kind`, `geo.approximate`, `geo.synthetic`, `geo.display_label`, `geo.address`, `geo.precision`.

- Los puntos son **ilustrativos** de alcaldía/municipio, no domicilios reales.
- `simulated_service_area`: abogado de videollamada; el pin representa un área de cobertura, no una oficina.
- `simulated_office_area`: punto ficticio para ensayar la experiencia presencial; no representa un local real.
- `address: null` en los 40 casos. No se recoge geolocalización del usuario ni se accede a su GPS.

## Dependencias y mapas

Se utiliza **Leaflet** (biblioteca JavaScript) y una capa raster de OpenStreetMap. Para la POC no se necesita API key ni backend. El mapa usa los tiles de `https://tile.openstreetmap.org/{z}/{x}/{y}.png`, con atribución visible.

### Limitaciones para producción

Los tiles públicos de OpenStreetMap no son un CDN comercial gratuito e ilimitado. La política oficial indica restricciones de uso masivo, precarga, caché, referer, atribución y ausencia de SLA. Antes de escalar, evaluar y contratar proveedor con capacidad y condiciones adecuadas, o infraestructura propia.

Referencia: https://operations.osmfoundation.org/policies/tiles/

Para abogados reales se requerirá obtención y consentimiento adecuado para publicar dirección profesional, verificación del lugar de atención, geocodificación con servicio autorizado, protección de ubicación privada y control sobre la visibilidad del despacho. La localización de un abogado exclusivamente remoto podrá mostrarse por área atendida, sin dirección personal.

## Pruebas
Abrir directorio demo; filtrar por CDMX/Edomex, materia, modalidad y costo; alternar Lista/Mapa y seleccionar marcador para ver ficha ficticia. Nunca hay reserva ni verificación real.
