import { describe, expect, it } from "vitest";
import { matchSpecialties, normalizeSearch } from "./matchSpecialties";
describe("legal specialty discovery", () => {
  it("ignores case and accents", () => expect(normalizeSearch("  PENSIÓN   ALIMENTICIA! ")).toBe("pension alimenticia"));
  it("understands everyday language", () => expect(matchSpecialties("me despidieron")[0]?.id).toBe("laboral"));
  it("recognizes family disputes", () => expect(matchSpecialties("pensión alimenticia")[0]?.id).toBe("familiar"));
  it("lists all specialties with an empty query", () => expect(matchSpecialties("")).toHaveLength(6));
  it("does not fabricate matches", () => expect(matchSpecialties("xyzabcxyz")).toHaveLength(0));
});
