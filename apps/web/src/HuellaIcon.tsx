import { PawPrint, type LucideProps } from "lucide-react";

/**
 * Identidad oficial HuellaVet: recuperar la huella original inclinada (~45°).
 * Los tres dedos son CÍRCULOS delineados (no puntos) y la almohadilla
 * mantiene la geometría asimétrica del ícono original.
 */
export function HuellaIcon(props: LucideProps) {
  return <PawPrint aria-hidden="true" {...props} />;
}

/**
 * Exactamente la misma geometría de Lucide PawPrint dentro de los pines Leaflet.
 * Se mantiene en un único lugar para evitar variantes entre web y mapa.
 */
export function huellaSvgMarkup(stroke = "#fff"): string {
  return `<svg x="9" y="9" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="${stroke}" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="11" cy="4" r="2" fill="none"/>
    <circle cx="18" cy="8" r="2" fill="none"/>
    <circle cx="20" cy="16" r="2" fill="none"/>
    <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" fill="none"/>
  </svg>`;
}
