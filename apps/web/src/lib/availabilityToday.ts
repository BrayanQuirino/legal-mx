import type { WorkingSettings } from "./availabilityPolicy";

export type MexicoClock = { date:string; minutes:number };

/**
 * A profile qualifies only if it has at least one unoccupied, future hourly
 * appointment TODAY in Mexico City during its own configured working hours.
 * No fabricated availability flags or inferred emergency coverage.
 */
export function hasAvailabilityToday(input: {
  profileId:string;
  bookingEnabled:boolean;
  schedule?:WorkingSettings;
  clock:MexicoClock;
  isUnavailable:(profileId:string,date:string,hour:string)=>boolean;
}):boolean {
  const {profileId,bookingEnabled,schedule,clock,isUnavailable}=input;
  if(!bookingEnabled||!schedule||schedule.endHour<=schedule.startHour)return false;
  const weekday=new Date(clock.date+"T12:00:00Z").getUTCDay();
  if(!schedule.weekdays.includes(weekday))return false;
  for(let h=Math.max(0,Math.ceil((clock.minutes+1)/60),schedule.startHour);h<Math.min(24,schedule.endHour);h++){
    const hour=String(h).padStart(2,"0")+":00";
    if(!isUnavailable(profileId,clock.date,hour))return true;
  }
  return false;
}
