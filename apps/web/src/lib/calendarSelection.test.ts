import { describe, expect, it } from "vitest";
import { rectangularSelection } from "./calendarSelection";
describe("spreadsheet calendar selection", () => {
  it("selects a diagonal rectangular range in either direction", () => {
    const cells = rectangularSelection({kind:"cell",day:4,hour:14},{kind:"cell",day:2,hour:12});
    expect(cells).toHaveLength(9);
    expect(cells).toContainEqual({day:2,hour:12});
    expect(cells).toContainEqual({day:4,hour:14});
  });
  it("drags across day headers to select complete day columns", () => {
    const cells = rectangularSelection({kind:"column",day:1,hour:0},{kind:"column",day:3,hour:0});
    expect(cells).toHaveLength(72);
    expect(cells).toContainEqual({day:1,hour:0});
    expect(cells).toContainEqual({day:3,hour:23});
  });
  it("drags across row headers to select all day columns for each hour", () => {
    const cells = rectangularSelection({kind:"row",day:0,hour:5},{kind:"row",day:0,hour:8});
    expect(cells).toHaveLength(28);
    expect(cells).toContainEqual({day:6,hour:8});
  });
  it("selects a whole single column or row from its title", () => {
    expect(rectangularSelection({kind:"column",day:2,hour:0},{kind:"column",day:2,hour:0})).toHaveLength(24);
    expect(rectangularSelection({kind:"row",day:0,hour:2},{kind:"row",day:0,hour:2})).toHaveLength(7);
  });
});
