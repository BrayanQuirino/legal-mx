import lawyers from "../../../../data/fixtures/lawyers.synthetic.json";
export type DemoLawyer = (typeof lawyers.records)[number];
export type Slot = { date: string; day: string; hour: string; key: string };
const localDate = new Intl.DateTimeFormat("en-CA", {timeZone:"America/Mexico_City", year:"numeric",month:"2-digit",day:"2-digit"});
const dayFmt = new Intl.DateTimeFormat("es-MX", {timeZone:"UTC",weekday:"short",day:"numeric",month:"short"});
export function getMexicoToday(): string {
  const parts = localDate.formatToParts(new Date());
  const by = (type: string) => parts.find(p=>p.type===type)?.value ?? "";
  return `${by("year")}-${by("month")}-${by("day")}`;
}
export function makeDemoSlots(lawyer: DemoLawyer, horizonDays=21): Slot[] {
  if(!lawyer.demo_schedule || !lawyer.demo_booking_enabled) return [];
  const base=new Date(getMexicoToday()+"T12:00:00Z");
  const result: Slot[]=[];
  for(let offset=1;offset<=horizonDays;offset++){
    const day=new Date(base.getTime()+offset*86400000);
    if(!lawyer.demo_schedule.weekdays.includes(day.getUTCDay()))continue;
    const date=day.toISOString().slice(0,10);
    for(let hour=lawyer.demo_schedule.start_hour;hour<lawyer.demo_schedule.end_hour;hour+=2){
      const h=String(hour).padStart(2,"0")+":00";
      result.push({date,day:dayFmt.format(day),hour:h,key:date+"|"+h});
    }
  }
  return result;
}
export const demoLawyers = lawyers.records.filter(l=>l.demo_booking_enabled);
