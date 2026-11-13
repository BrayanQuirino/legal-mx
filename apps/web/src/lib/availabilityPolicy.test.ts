import {describe,expect,it} from "vitest";
import {slotEnabled,type AvailabilityPolicy} from "./availabilityPolicy";
const baseline:AvailabilityPolicy={
  lawyerId:"demo-lawyer-001",date:"2026-11-16",hour:"10:00",today:"2026-11-13",
  profile:{startHour:9,endHour:18,weekdays:[1,2,3,4,5]},
  blocked:[],enabledSlots:[],leaves:[],daysOff:{},weeklyBlockedHours:{}
};
const override=(hour:string,date="2026-11-16")=>({lawyerId:baseline.lawyerId,date,hour});
describe("individual lawyer calendar cells",()=>{
  it("shows configured work hours by default",()=>{
    expect(slotEnabled(baseline)).toBe(true);
    expect(slotEnabled({...baseline,hour:"03:00"})).toBe(false);
  });
  it("lets a lawyer open one grey 3 AM cell without opening others",()=>{
    const edit={...baseline,enabledSlots:[override("03:00")]};
    expect(slotEnabled({...edit,hour:"03:00"})).toBe(true);
    expect(slotEnabled({...edit,hour:"04:00"})).toBe(false);
    expect(slotEnabled({...edit,date:"2026-11-17",hour:"03:00"})).toBe(false);
  });
  it("individually closes an otherwise open cell, then restores it",()=>{
    const edit={...baseline,blocked:[override("10:00")]};
    expect(slotEnabled(edit)).toBe(false);
    expect(slotEnabled({...edit,blocked:[],enabledSlots:[override("10:00")]})).toBe(true);
  });
  it("supports explicitly opening an exception inside a blocked row",()=>{
    const bulk={...baseline,weeklyBlockedHours:{[baseline.lawyerId]:[10]}};
    expect(slotEnabled(bulk)).toBe(false);
    expect(slotEnabled({...bulk,enabledSlots:[override("10:00")]})).toBe(true);
  });
  it("supports a one-off exception to a rest day",()=>{
    const off={...baseline,leaves:[{lawyerId:baseline.lawyerId,date:baseline.date}]};
    expect(slotEnabled(off)).toBe(false);
    expect(slotEnabled({...off,enabledSlots:[override("10:00")]})).toBe(true);
  });
  it("applies future hourly recurring blocks only from their starting week",()=>{
    const policy={...baseline,recurringHours:[{lawyerId:baseline.lawyerId,hour:10,fromDate:"2026-11-23",blocked:true}]};
    expect(slotEnabled({...policy,date:"2026-11-16"})).toBe(true);
    expect(slotEnabled({...policy,date:"2026-11-23"})).toBe(false);
    expect(slotEnabled({...policy,date:"2026-11-30"})).toBe(false);
  });
  it("can later end a repeating hour block without changing history",()=>{
    const policy={...baseline,recurringHours:[
      {lawyerId:baseline.lawyerId,hour:10,fromDate:"2026-11-16",blocked:true},
      {lawyerId:baseline.lawyerId,hour:10,fromDate:"2026-11-30",blocked:false}
    ]};
    expect(slotEnabled(policy)).toBe(false);
    expect(slotEnabled({...policy,date:"2026-11-23"})).toBe(false);
    expect(slotEnabled({...policy,date:"2026-11-30"})).toBe(true);
  });
  it("blocks every Monday from selected date, without blocking earlier Mondays",()=>{
    const policy={...baseline,recurringDays:[{lawyerId:baseline.lawyerId,weekday:1,fromDate:"2026-11-23",off:true}]};
    expect(slotEnabled(policy)).toBe(true);
    expect(slotEnabled({...policy,date:"2026-11-23"})).toBe(false);
    expect(slotEnabled({...policy,date:"2026-11-30"})).toBe(false);
    expect(slotEnabled({...policy,date:"2026-11-24"})).toBe(true);
  });
  it("never allows reopening a past or current-day slot",()=>{
    expect(slotEnabled({...baseline,date:"2026-11-12",enabledSlots:[override("10:00","2026-11-12")]})).toBe(false);
    expect(slotEnabled({...baseline,date:"2026-11-13",enabledSlots:[override("10:00","2026-11-13")]})).toBe(false);
  });
});
