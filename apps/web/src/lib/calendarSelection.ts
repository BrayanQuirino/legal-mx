export type GridSelectionPoint = {
  kind: "cell" | "row" | "column";
  day: number;
  hour: number;
};
export type GridCell = { day: number; hour: number };

/** The user's starting header determines whether all days or all hours are selected. */
export function rectangularSelection(start: GridSelectionPoint, end: GridSelectionPoint): GridCell[] {
  const firstHour = start.kind === "column" ? 0 : Math.min(start.hour, end.hour);
  const lastHour = start.kind === "column" ? 23 : Math.max(start.hour, end.hour);
  const firstDay = start.kind === "row" ? 0 : Math.min(start.day, end.day);
  const lastDay = start.kind === "row" ? 6 : Math.max(start.day, end.day);
  const result: GridCell[] = [];
  for (let hour = firstHour; hour <= lastHour; hour++) {
    for (let day = firstDay; day <= lastDay; day++) {
      result.push({ day, hour });
    }
  }
  return result;
}
