import { describe, expect, it } from "vitest";
import lawyers from "../../../../data/fixtures/lawyers.synthetic.json";
import users from "../../../../data/fixtures/users.synthetic.json";

describe("synthetic Legal MX fixtures", () => {
  it("contains the expected amount of sample records", () => {
    expect(lawyers.records).toHaveLength(40);
    expect(users.records).toHaveLength(100);
  });

  it("uses unique fixture identifiers", () => {
    const ids = [...lawyers.records, ...users.records].map((record) => record.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("does not impersonate verified lawyers or include real contact information", () => {
    expect(lawyers.records.every((lawyer) =>
      lawyer.is_synthetic &&
      lawyer.public_profile_enabled === false &&
      lawyer.professional_license === null &&
      lawyer.license_verified_at === null &&
      lawyer.verification_status === "synthetic_unverified" &&
      lawyer.rating === null
    )).toBe(true);
    expect(users.records.every((user) =>
      user.is_synthetic &&
      user.email.endsWith("@example.test") &&
      user.phone === null
    )).toBe(true);
  });

  it("stores only bounded, synthetic, approximate positions", () => {
    expect(lawyers.records.every(lawyer =>
      lawyer.geo.synthetic === true && lawyer.geo.approximate === true &&
      lawyer.geo.address === null &&
      Number.isFinite(lawyer.geo.latitude) && lawyer.geo.latitude >= 18.8 && lawyer.geo.latitude <= 20 &&
      Number.isFinite(lawyer.geo.longitude) && lawyer.geo.longitude >= -100.1 && lawyer.geo.longitude <= -98.6 &&
      lawyer.geo.kind === (lawyer.consultation_modes.includes("presencial") ? "simulated_office_area" : "simulated_service_area")
    )).toBe(true);
  });

  it("covers two jurisdictions and six specialties", () => {
    const jurisdictions = new Set(lawyers.records.flatMap((lawyer) => lawyer.jurisdictions));
    const specialties = new Set(lawyers.records.flatMap((lawyer) => lawyer.specialties));
    expect([...jurisdictions].sort()).toEqual(["CDMX", "EDOMEX"]);
    expect(specialties.size).toBe(6);
  });
});
