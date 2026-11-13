import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import fixture from "../../../data/fixtures/appointments.synthetic.json";
import { demoLawyers, makeDemoSlots } from "./lib/scheduling";

export type Mode = "online"|"presencial";
export type Appointment = { id:string;lawyer_id:string;user_id:string;date:string;hour:string;modality:Mode;status:"confirmed"|"pending"|"cancelled";synthetic:true };
export type Profile = { modes:Mode[];price:number;location:string };
export type Block = { lawyerId:string;date:string;hour:string };
export type Leave = { lawyerId:string;date:string };

const initialAppointments:Appointment[] = fixture.records.flatMap(row=>{
  const lawyer=demoLawyers.find(item=>item.id===row.lawyer_id);
  const slot=lawyer && makeDemoSlots(lawyer)[row.slot_index];
  if(!slot)return [];
  return [{id:row.id,lawyer_id:row.lawyer_id,user_id:row.user_id,date:slot.date,hour:slot.hour,modality:row.modality as Mode,status:row.status as "confirmed"|"pending",synthetic:true}];
});
const initialProfiles:Record<string,Profile> = Object.fromEntries(demoLawyers.map(l=>[l.id,{
  modes:l.consultation_modes as Mode[],price:l.consultation_price_mxn_demo,location:l.municipality
}]));

type Store = {
  appointments:Appointment[];
  profiles:Record<string,Profile>;
  blocked:Block[];
  leaves:Leave[];
  daysOff:Record<string,number[]>;
  book:(lawyerId:string,userId:string,date:string,hour:string,modality:Mode)=>boolean;
  updateStatus:(appointmentId:string,status:"confirmed"|"cancelled")=>void;
  toggleBlock:(lawyerId:string,date:string,hour:string)=>void;
  toggleLeave:(lawyerId:string,date:string)=>void;
  toggleWeekdayOff:(lawyerId:string,weekday:number)=>void;
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
  const [leaves,setLeaves]=useState<Leave[]>([]);
  const [daysOff,setDaysOff]=useState<Record<string,number[]>>({});
  const isUnavailable=(lawyerId:string,date:string,hour:string)=>{
    const day=new Date(date+"T12:00:00Z").getUTCDay();
    return appointments.some(a=>a.lawyer_id===lawyerId&&a.date===date&&a.hour===hour&&a.status!=="cancelled")
      ||blocked.some(b=>b.lawyerId===lawyerId&&b.date===date&&b.hour===hour)
      ||leaves.some(l=>l.lawyerId===lawyerId&&l.date===date)
      ||(daysOff[lawyerId]??[]).includes(day);
  };
  const book=(lawyerId:string,userId:string,date:string,hour:string,modality:Mode)=>{
    const lawyer=demoLawyers.find(l=>l.id===lawyerId);
    if(!lawyer||!userId||!profiles[lawyerId]?.modes.includes(modality)
      ||!makeDemoSlots(lawyer).some(s=>s.date===date&&s.hour===hour)
      ||isUnavailable(lawyerId,date,hour))return false;
    setAppointments(prev=>[...prev,{id:"demo-new-"+(prev.length+1),lawyer_id:lawyerId,user_id:userId,date,hour,modality,status:"pending",synthetic:true}]);
    return true;
  };
  const updateStatus=(id:string,status:"confirmed"|"cancelled")=>setAppointments(prev=>prev.map(a=>a.id===id?{...a,status}:a));
  const toggleBlock=(lawyerId:string,date:string,hour:string)=>setBlocked(prev=>prev.some(b=>b.lawyerId===lawyerId&&b.date===date&&b.hour===hour)?prev.filter(b=>!(b.lawyerId===lawyerId&&b.date===date&&b.hour===hour)):[...prev,{lawyerId,date,hour}]);
  const toggleLeave=(lawyerId:string,date:string)=>setLeaves(prev=>prev.some(l=>l.lawyerId===lawyerId&&l.date===date)?prev.filter(l=>!(l.lawyerId===lawyerId&&l.date===date)):[...prev,{lawyerId,date}]);
  const toggleWeekdayOff=(lawyerId:string,weekday:number)=>setDaysOff(prev=>({...prev,[lawyerId]:(prev[lawyerId]??[]).includes(weekday)?prev[lawyerId].filter(d=>d!==weekday):[...(prev[lawyerId]??[]),weekday]}));
  const updateProfile=(id:string,changes:Partial<Profile>)=>setProfiles(prev=>({...prev,[id]:{...prev[id],...changes}}));
  const store=useMemo(()=>({appointments,profiles,blocked,leaves,daysOff,book,updateStatus,toggleBlock,toggleLeave,toggleWeekdayOff,updateProfile,isUnavailable}),[appointments,profiles,blocked,leaves,daysOff]);
  return <Context.Provider value={store}>{children}</Context.Provider>;
}
export function useDemoStore(){
  const value=useContext(Context);
  if(!value)throw new Error("Demo store not available");
  return value;
}
