import { describe, expect, it } from "vitest";
import { distanceKm, isWithinRadius, MAP_CENTERS } from "./geo";
describe("radius matching", () => {
  it("distance from a point to itself is zero", () => {
    expect(distanceKm(MAP_CENTERS.cdmx, MAP_CENTERS.cdmx)).toBe(0);
  });
  it("includes center and respects an increasing radius", () => {
    const near = { latitude: 19.44, longitude: -99.14 };
    expect(isWithinRadius(near, MAP_CENTERS.cdmx, 5)).toBe(true);
    expect(isWithinRadius(MAP_CENTERS.toluca, MAP_CENTERS.cdmx, 5)).toBe(false);
    expect(isWithinRadius(MAP_CENTERS.toluca, MAP_CENTERS.cdmx, 100)).toBe(true);
  });
  it("is symmetric", () => {
    expect(distanceKm(MAP_CENTERS.cdmx, MAP_CENTERS.naucalpan)).toBeCloseTo(distanceKm(MAP_CENTERS.naucalpan, MAP_CENTERS.cdmx), 6);
  });
  it("reducing radius cannot increase matching profiles", () => {
    const entries = [MAP_CENTERS.cdmx, MAP_CENTERS.naucalpan, MAP_CENTERS.toluca];
    const small = entries.filter(point => isWithinRadius(point, MAP_CENTERS.cdmx, 10)).length;
    const large = entries.filter(point => isWithinRadius(point, MAP_CENTERS.cdmx, 100)).length;
    expect(large).toBeGreaterThanOrEqual(small);
  });
});
