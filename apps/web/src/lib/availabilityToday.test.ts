import {describe,expect,it,vi} from "vitest";
import {hasAvailabilityToday} from "./availabilityToday";
import {getMexicoNow} from "./scheduling";
const schedule={startHour:9,endHour:17,weekdays:[1,2,3,4,5]};
const base={profileId:"demo-vet-001",bookingEnabled:true,schedule,
  clock:{date:"2026-11-17",minutes:9*60+30}};

describe("Con disponibilidad hoy",()=>{
  it("uses Mexico City time regardless of the browser timezone",()=>{
    expect(getMexicoNow(new Date("2026-11-17T07:35:00Z"))).toEqual({date:"2026-11-17",minutes:95});
    expect(getMexicoNow(new Date("2026-11-17T16:20:00Z"))).toEqual({date:"2026-11-17",minutes:620});
  });
  it("requires a real future hourly slot, not merely a profile approval flag",()=>{
    const isUnavailable=vi.fn(()=>false);
    expect(hasAvailabilityToday({...base,isUnavailable})).toBe(true);
    expect(isUnavailable).toHaveBeenCalledWith("demo-vet-001","2026-11-17","10:00");
    expect(isUnavailable).not.toHaveBeenCalledWith("demo-vet-001","2026-11-17","09:00");
  });
  it("rejects unbookable profiles, closed days, and hours after closing",()=>{
    const isUnavailable=()=>false;
    expect(hasAvailabilityToday({...base,bookingEnabled:false,isUnavailable})).toBe(false);
    expect(hasAvailabilityToday({...base,clock:{date:"2026-11-22",minutes:600},isUnavailable})).toBe(false);
    expect(hasAvailabilityToday({...base,clock:{date:"2026-11-17",minutes:16*60+30},isUnavailable})).toBe(false);
  });
  it("rejects a fully reserved or blocked day and accepts a later free slot",()=>{
    expect(hasAvailabilityToday({...base,isUnavailable:()=>true})).toBe(false);
    expect(hasAvailabilityToday({...base,isUnavailable:(_id,_date,hour)=>hour!=="15:00"})).toBe(true);
  });
});
