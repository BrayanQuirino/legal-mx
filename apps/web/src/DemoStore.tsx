import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import fixture from "../../../data/fixtures/appointments.synthetic.json";
import { demoLawyers, makeDemoSlots, getMexicoToday } from "./lib/scheduling";
import { slotEnabled, latestRule, type HourRule, type DayRule } from "./lib/availabilityPolicy";

export type Mode = "online"|"presencial";
export type Appointment = { id:string;lawyer_id:string;user_id:string;date:string;hour:string;modality:Mode;status:"confirmed"|"pending"|"cancelled";synthetic:true };
export type Profile = { modes:Mode[];price:number;location:string;startHour:number;endHour:number;weekdays:number[] };
export type Block = { lawyerId:string;date:string;hour:string };
export type Leave = { lawyerId:string;date:string };

const initialAppointments:Appointment[] = fixture.records.flatMap(row=>{
  const lawyer=demoLawyers.find(item=>item.id===row.lawyer_id);
  const slot=lawyer && makeDemoSlots(lawyer)[row.slot_index];
  if(!slot)return [];
  return [{id:row.id,lawyer_id:row.lawyer_id,user_id:row.user_id,date:slot.date,hour:slot.hour,modality:row.modality as Mode,status:row.status as "confirmed"|"pending",synthetic:true}];
});
const initialProfiles:Record<string,Profile> = Object.fromEntries(demoLawyers.map(l=>[l.id,{
  modes:l.consultation_modes as Mode[],price:l.consultation_price_mxn_demo,location:l.municipality,startHour:l.demo_schedule?.start_hour ?? 9,endHour:l.demo_schedule?.end_hour ?? 18,weekdays:l.demo_schedule?.weekdays ?? [1,2,3,4,5]
}]));

type Store = {
  appointments:Appointment[];
  profiles:Record<string,Profile>;
  blocked:Block[];
  enabledSlots:Block[];
  leaves:Leave[];
  daysOff:Record<string,number[]>;
  weeklyBlockedHours:Record<string,number[]>;
  recurringHours:HourRule[];
  recurringDays:DayRule[];
  book:(lawyerId:string,userId:string,date:string,hour:string,modality:Mode)=>boolean;
  updateStatus:(appointmentId:string,status:"confirmed"|"cancelled")=>void;
  toggleBlock:(lawyerId:string,date:string,hour:string)=>void;
  toggleSlot:(lawyerId:string,date:string,hour:string)=>void;
  toggleLeave:(lawyerId:string,date:string)=>void;
  toggleWeekdayOff:(lawyerId:string,weekday:number)=>void;
  toggleWeeklyHour:(lawyerId:string,hour:number)=>void;
  setRowScope:(lawyerId:string,hour:number,dates:string[],scope:"week"|"future",blocked:boolean)=>void;
  setDayScope:(lawyerId:string,date:string,scope:"once"|"future",off:boolean)=>void;
  isWorkingSlot:(lawyerId:string,date:string,hour:string)=>boolean;
  updateProfile:(lawyerId:string,changes:Partial<Profile>)=>void;
  isUnavailable:(lawyerId:string,date:string,hour:string)=>boolean;
};
const Context=createContext<Store|null>(null);

/** All data is synthetic, and all edits live only in React memory until page reload.
 * Never use client-side role screens as authorization in production.
 */
export function DemoStoreProvider({children}:{children:ReactNode}){
  const [appointments,setAppointments]=useState<Appointment[]>(initialAppointments);
  const [profiles,setProfiles]=useState<Record<string,Profile>>(initialProfiles);
  const [blocked,setBlocked]=useState<Block[]>([]);
  const [enabledSlots,setEnabledSlots]=useState<Block[]>([]);
  const [leaves,setLeaves]=useState<Leave[]>([]);
  const [daysOff,setDaysOff]=useState<Record<string,number[]>>({});
  const [weeklyBlockedHours,setWeeklyBlockedHours]=useState<Record<string,number[]>>({});
  const [recurringHours,setRecurringHours]=useState<HourRule[]>([]);
  const [recurringDays,setRecurringDays]=useState<DayRule[]>([]);
  const isWorkingSlot=(lawyerId:string,date:string,hour:string)=>slotEnabled({
    lawyerId,date,hour,today:getMexicoToday(),profile:profiles[lawyerId],
    blocked,enabledSlots,leaves,daysOff,weeklyBlockedHours,recurringHours,recurringDays
  });
  const isUnavailable=(lawyerId:string,date:string,hour:string)=>
    !isWorkingSlot(lawyerId,date,hour)
    ||appointments.some(a=>a.lawyer_id===lawyerId&&a.date===date&&a.hour===hour&&a.status!=="cancelled");
  const toggleSlot=(lawyerId:string,date:string,hour:string)=>{
    if(date<=getMexicoToday() || appointments.some(a=>a.lawyer_id===lawyerId&&a.date===date&&a.hour===hour&&a.status!=="cancelled"))return;
    const same=(entry:Block)=>entry.lawyerId===lawyerId&&entry.date===date&&entry.hour===hour;
    if(isWorkingSlot(lawyerId,date,hour)){
      setEnabledSlots(prev=>prev.filter(entry=>!same(entry)));
      setBlocked(prev=>prev.some(same)?prev:[...prev,{lawyerId,date,hour}]);
    }else{
      setBlocked(prev=>prev.filter(entry=>!same(entry)));
      setEnabledSlots(prev=>prev.some(same)?prev:[...prev,{lawyerId,date,hour}]);
    }
  };
  const book=(lawyerId:string,userId:string,date:string,hour:string,modality:Mode)=>{
    const lawyer=demoLawyers.find(l=>l.id===lawyerId);
    if(!lawyer||!userId||!profiles[lawyerId]?.modes.includes(modality)
      ||!isWorkingSlot(lawyerId,date,hour)
      ||isUnavailable(lawyerId,date,hour))return false;
    setAppointments(prev=>[...prev,{id:"demo-new-"+(prev.length+1),lawyer_id:lawyerId,user_id:userId,date,hour,modality,status:"pending",synthetic:true}]);
    return true;
  };
  const updateStatus=(id:string,status:"confirmed"|"cancelled")=>setAppointments(prev=>prev.map(a=>a.id===id?{...a,status}:a));
  const toggleBlock=toggleSlot;
  const toggleLeave=(lawyerId:string,date:string)=>setLeaves(prev=>prev.some(l=>l.lawyerId===lawyerId&&l.date===date)?prev.filter(l=>!(l.lawyerId===lawyerId&&l.date===date)):[...prev,{lawyerId,date}]);
  const toggleWeeklyHour=(lawyerId:string,hour:number)=>setWeeklyBlockedHours(prev=>({...prev,[lawyerId]:(prev[lawyerId]??[]).includes(hour)?prev[lawyerId].filter(h=>h!==hour):[...(prev[lawyerId]??[]),hour]}));
  /** Scope-sensitive bulk actions do not touch already booked appointments. */
  const setRowScope=(lawyerId:string,hour:number,dates:string[],scope:"week"|"future",shouldBlock:boolean)=>{
    const hh=String(hour).padStart(2,"0")+":00";
    if(scope==="future"){
      const fromDate=dates[0];
      setRecurringHours(prev=>[...prev.filter(rule=>!(rule.lawyerId===lawyerId&&rule.hour===hour&&rule.fromDate===fromDate)),
        {lawyerId,hour,fromDate,blocked:shouldBlock}]);
      return;
    }
    const matches=(slot:Block)=>slot.lawyerId===lawyerId&&slot.hour===hh&&dates.includes(slot.date);
    const closedDay=(date:string)=>{
      const day=new Date(date+"T12:00:00Z").getUTCDay();
      const recurring=latestRule(recurringDays.filter(r=>r.lawyerId===lawyerId&&r.weekday===day),date);
      return !profiles[lawyerId]?.weekdays.includes(day)
        ||leaves.some(l=>l.lawyerId===lawyerId&&l.date===date)
        ||(daysOff[lawyerId]??[]).includes(day)
        ||Boolean(recurring?.off);
    };
    // Opening a whole row must not reopen dates already marked as rest/closed.
    const valid=dates.filter(date=>date>getMexicoToday()
      &&(shouldBlock||!closedDay(date))
      &&!appointments.some(a=>a.lawyer_id===lawyerId&&a.date===date&&a.hour===hh&&a.status!=="cancelled"));
    if(shouldBlock){
      setEnabledSlots(prev=>prev.filter(slot=>!matches(slot)));
      setBlocked(prev=>[...prev.filter(slot=>!matches(slot)),...valid.map(date=>({lawyerId,date,hour:hh}))]);
    }else{
      setBlocked(prev=>prev.filter(slot=>!matches(slot)));
      setEnabledSlots(prev=>[...prev.filter(slot=>!matches(slot)),...valid.map(date=>({lawyerId,date,hour:hh}))]);
    }
  };
  const setDayScope=(lawyerId:string,date:string,scope:"once"|"future",off:boolean)=>{
    if(scope==="future"){
      const weekday=new Date(date+"T12:00:00Z").getUTCDay();
      setRecurringDays(prev=>[...prev.filter(rule=>!(rule.lawyerId===lawyerId&&rule.weekday===weekday&&rule.fromDate===date)),
        {lawyerId,weekday,fromDate:date,off}]);
      return;
    }
    setLeaves(prev=>off?[...prev.filter(rule=>!(rule.lawyerId===lawyerId&&rule.date===date)),{lawyerId,date}]:
      prev.filter(rule=>!(rule.lawyerId===lawyerId&&rule.date===date)));
    if(off){
      // Closing a column also clears isolated open exceptions, not reservations.
      setEnabledSlots(prev=>prev.filter(slot=>!(slot.lawyerId===lawyerId&&slot.date===date)));
    }else{
      // Explicitly reopening a day restores the usual configured working hours,
      // including a day whose recurring day-off rule is still in force.
      const profile=profiles[lawyerId];
      if(profile){
        const hours=Array.from({length:Math.max(0,profile.endHour-profile.startHour)},(_,i)=>String(profile.startHour+i).padStart(2,"0")+":00");
        setEnabledSlots(prev=>{
          const additional=hours.filter(hour=>!appointments.some(a=>a.lawyer_id===lawyerId&&a.date===date&&a.hour===hour&&a.status!=="cancelled")
            &&!prev.some(slot=>slot.lawyerId===lawyerId&&slot.date===date&&slot.hour===hour))
            .map(hour=>({lawyerId,date,hour}));
          return [...prev,...additional];
        });
      }
    }
    // An explicitly reopened day can override the one-off leave with the original weekly rules;
    // we deliberately do not erase bookings or disable recurring restrictions.
  };
  const toggleWeekdayOff=(lawyerId:string,weekday:number)=>setDaysOff(prev=>({...prev,[lawyerId]:(prev[lawyerId]??[]).includes(weekday)?prev[lawyerId].filter(d=>d!==weekday):[...(prev[lawyerId]??[]),weekday]}));
  const updateProfile=(id:string,changes:Partial<Profile>)=>setProfiles(prev=>({...prev,[id]:{...prev[id],...changes}}));
  const store=useMemo(()=>({appointments,profiles,blocked,enabledSlots,leaves,daysOff,weeklyBlockedHours,recurringHours,recurringDays,book,updateStatus,toggleBlock,toggleSlot,toggleLeave,toggleWeekdayOff,toggleWeeklyHour,setRowScope,setDayScope,updateProfile,isUnavailable,isWorkingSlot}),[appointments,profiles,blocked,enabledSlots,leaves,daysOff,weeklyBlockedHours,recurringHours,recurringDays]);
  return <Context.Provider value={store}>{children}</Context.Provider>;
}
export function useDemoStore(){
  const value=useContext(Context);
  if(!value)throw new Error("Demo store not available");
  return value;
}
