import {describe,expect,it} from "vitest";
import {matchSpecialties,normalizeSearch} from "./matchSpecialties";
describe("veterinary specialty discovery",()=>{
 it("normalizes accents and case",()=>expect(normalizeSearch("  VACUNACIÓN! ")).toBe("vacunacion"));
 it("finds prevention",()=>expect(matchSpecialties("necesito vacunas para mi perro")[0]?.id).toBe("medicina_general"));
 it("finds skin care",()=>expect(matchSpecialties("mi gato tiene alergia")[0]?.id).toBe("dermatologia"));
 it("recognizes rabbits",()=>expect(matchSpecialties("conejo")[0]?.id).toBe("animales_exoticos"));
 it("offers six veterinary specialties",()=>expect(matchSpecialties("")).toHaveLength(6));
 it("does not invent unrelated matches",()=>expect(matchSpecialties("xyzabcxyz")).toHaveLength(0));
});
