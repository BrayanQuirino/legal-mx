import { describe,expect,it } from "vitest";
import {specialties} from "./specialties";
import {animalCategories,companionAnimalCategories,treatsAnimalCategory} from "./animalCategories";
import {matchSpecialties} from "../lib/matchSpecialties";
import vets from "../../../../data/fixtures/veterinarians.synthetic.json";

const collator=new Intl.Collator("es",{sensitivity:"base"});

describe("HuellaVet approved catalogues",()=>{
  it("has exactly 14 alphabetically sorted veterinary areas without changing legacy IDs",()=>{
    expect(specialties).toHaveLength(14);
    expect(specialties.map(item=>item.name)).toEqual([...specialties.map(item=>item.name)].sort(collator.compare));
    const ids=new Set(specialties.map(item=>item.id));
    expect(ids.size).toBe(14);
    expect(["medicina_general","dermatologia","cirugia","urgencias","odontologia","animales_exoticos"].every(id=>ids.has(id))).toBe(true);
    expect(vets.records.every(vet=>vet.specialties.every(id=>ids.has(id)))).toBe(true);
  });
  it("prepares ten categories while showing only eight companion groups",()=>{
    expect(animalCategories).toHaveLength(10);
    expect(companionAnimalCategories).toHaveLength(8);
    expect(companionAnimalCategories.map(item=>item.name)).toEqual([...companionAnimalCategories.map(item=>item.name)].sort(collator.compare));
    expect(animalCategories.filter(item=>!item.visible).map(item=>item.id)).toEqual(["animales_granja","equinos"]);
  });
  it("doesn't infer that an exotic veterinarian treats every species",()=>{
    expect(treatsAnimalCategory(["aves","conejos"],"aves")).toBe(true);
    expect(treatsAnimalCategory(["aves","conejos"],"conejos")).toBe(true);
    expect(treatsAnimalCategory(["aves","conejos"],"reptiles")).toBe(false);
    expect(treatsAnimalCategory(["perros"],"pequenos_mamiferos")).toBe(false);
    expect(treatsAnimalCategory(["perros"],"all")).toBe(true);
  });
  it("maps common care requests onto approved catalogue entries",()=>{
    expect(matchSpecialties("tiene alergia")[0]?.id).toBe("dermatologia");
    expect(matchSpecialties("vacunacion")[0]?.id).toBe("medicina_general");
    expect(matchSpecialties("cardiologia")[0]?.id).toBe("cardiologia");
  });
});
