/** Geographic distance between two points on Earth, in kilometers (haversine formula). */
export type Coordinates = { latitude: number; longitude: number };
export function distanceKm(a: Coordinates, b: Coordinates): number {
  const rad = Math.PI / 180;
  const latDiff = (b.latitude - a.latitude) * rad;
  const longDiff = (b.longitude - a.longitude) * rad;
  const term = Math.sin(latDiff / 2) ** 2
    + Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(longDiff / 2) ** 2;
  return 6371.0088 * 2 * Math.atan2(Math.sqrt(term), Math.sqrt(Math.max(0, 1 - term)));
}
export function isWithinRadius(point: Coordinates, center: Coordinates, radiusKm: number): boolean {
  return distanceKm(point, center) <= radiusKm;
}
export const MAP_CENTERS = {
  cdmx: { latitude: 19.4326, longitude: -99.1332, label: "Centro de CDMX" },
  naucalpan: { latitude: 19.478, longitude: -99.237, label: "Naucalpan" },
  toluca: { latitude: 19.288, longitude: -99.655, label: "Toluca" },
} as const;
