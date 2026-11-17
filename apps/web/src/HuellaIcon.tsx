import type { SVGProps } from "react";

/**
 * HuellaVet's shared brand mark: exactly THREE outlined circular toes and one
 * organic lower pad. No filled dots. Both React icons and Leaflet pins use
 * these same vector coordinates.
 */
const TOES = [
  { cx: 5.8, cy: 7, r: 2.25 },
  { cx: 12, cy: 4.7, r: 2.25 },
  { cx: 18.2, cy: 7, r: 2.25 },
] as const;
const PAD_PATH = "M12 11.1c-1.8 0-2.8 1.15-3.9 2.65-.65.87-1.33 1.55-2.2 2.18-1.55 1.15-1.35 3.45.26 4.2 1.35.62 2.48-.13 3.75-.78.87-.44 1.43-.6 2.09-.6s1.22.16 2.09.6c1.27.65 2.4 1.4 3.75.78 1.61-.75 1.81-3.05.26-4.2-.87-.63-1.55-1.31-2.2-2.18C14.8 12.25 13.8 11.1 12 11.1Z";

type Props = Omit<SVGProps<SVGSVGElement>, "size"> & {
  size?: number | string;
  strokeWidth?: number;
};

export function HuellaIcon({ size = 24, strokeWidth = 2, className = "", ...rest }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`huella-icon ${className}`.trim()}
      {...rest}
    >
      {TOES.map(toe => <circle key={toe.cx} cx={toe.cx} cy={toe.cy} r={toe.r} fill="none" />)}
      <path d={PAD_PATH} fill="none" />
    </svg>
  );
}

// Embedded in the map pin, using the EXACT SAME geometry as the React mark.
export function huellaSvgMarkup(stroke = "#fff"): string {
  const circles = TOES.map(({ cx, cy, r }) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none"/>`
  ).join("");
  return `<svg x="9" y="9" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${circles}<path d="${PAD_PATH}" fill="none"/></svg>`;
}
