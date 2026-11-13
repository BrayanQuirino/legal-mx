/** Deterministic availability policy for the synthetic Legal MX scheduling POC.
 * Individual manual slot edits take precedence over weekly defaults.
 * Existing bookings are always checked separately, before accepting another booking.
 */
export type SlotOverride = {lawyerId:string;date:string;hour:string};
export type LeaveOverride = {lawyerId:string;date:string};
export type HourRule = {lawyerId:string;hour:number;fromDate:string;blocked:boolean};
export type DayRule = {lawyerId:string;weekday:number;fromDate:string;off:boolean};
export function latestRule<T extends {fromDate:string}>(rules:readonly T[],date:string):T|undefined {return [...rules].filter(rule=>rule.fromDate<=date).sort((a,b)=>b.fromDate.localeCompare(a.fromDate))[0];}
export type WorkingSettings = {startHour:number;endHour:number;weekdays:number[]};
export type AvailabilityPolicy = {
  lawyerId:string;
  date:string;
  hour:string;
  today:string;
  profile?:WorkingSettings;
  blocked:readonly SlotOverride[];
  enabledSlots:readonly SlotOverride[];
  leaves:readonly LeaveOverride[];
  daysOff:Record<string,number[]>;
  weeklyBlockedHours:Record<string,number[]>;
  recurringHours?:readonly HourRule[];
  recurringDays?:readonly DayRule[];
};
export function slotEnabled(input:AvailabilityPolicy):boolean {
  const {lawyerId,date,hour,today,profile,blocked,enabledSlots,leaves,daysOff,weeklyBlockedHours,recurringHours=[],recurringDays=[]}=input;
  if(!profile||date<=today)return false;
  const same=(slot:SlotOverride)=>slot.lawyerId===lawyerId&&slot.date===date&&slot.hour===hour;
  if(blocked.some(same))return false;
  if(enabledSlots.some(same))return true;
  const hourNumber=Number(hour.slice(0,2));
  const weekday=new Date(date+"T12:00:00Z").getUTCDay();
  const hourRule=latestRule(recurringHours.filter(rule=>rule.lawyerId===lawyerId&&rule.hour===hourNumber),date);
  const dayRule=latestRule(recurringDays.filter(rule=>rule.lawyerId===lawyerId&&rule.weekday===weekday),date);
  return hourNumber>=profile.startHour&&hourNumber<profile.endHour
    &&profile.weekdays.includes(weekday)
    &&!(weeklyBlockedHours[lawyerId]??[]).includes(hourNumber)
    &&!(hourRule?.blocked??false)
    &&!(dayRule?.off??false)
    &&!(daysOff[lawyerId]??[]).includes(weekday)
    &&!leaves.some(leave=>leave.lawyerId===lawyerId&&leave.date===date);
}
