import type { DisplayWeekKey, ScheduleOccurrence } from "./occurrences";
import type { TimeRange } from "./time-range";
import { timeToMinutes } from "./time";
import { isSupportedScheduleRange } from "./time-bounds";

export type PositionedOccurrence = ScheduleOccurrence & {
  column: number;
  columnCount: number;
  leftPercent: number;
  widthPercent: number;
  top: number;
  height: number;
};

type WorkingOccurrence = ScheduleOccurrence & {
  column: number;
  cluster: number;
};

function layoutColumn(entries: ScheduleOccurrence[]): WorkingOccurrence[] {
  const sorted = [...entries].sort(
    (left, right) =>
      left.startMinutes - right.startMinutes ||
      left.endMinutes - right.endMinutes ||
      left.id.localeCompare(right.id),
  );
  const active: WorkingOccurrence[] = [];
  const output: WorkingOccurrence[] = [];
  let cluster = -1;
  for (const entry of sorted) {
    const stillActive = active.filter(
      (candidate) => candidate.endMinutes > entry.startMinutes,
    );
    active.splice(0, active.length, ...stillActive);
    if (active.length === 0) cluster += 1;
    const usedColumns = new Set(active.map((candidate) => candidate.column));
    let column = 0;
    while (usedColumns.has(column)) column += 1;
    const placed = { ...entry, column, cluster };
    active.push(placed);
    output.push(placed);
  }
  return output;
}

export function calculateOverlapLayout(
  occurrences: readonly ScheduleOccurrence[],
  timeRange: Pick<TimeRange, "startTime" | "endTime">,
  canvasHeight: number,
  minimumBlockHeight = 18,
): PositionedOccurrence[] {
  if (
    !isSupportedScheduleRange(timeRange.startTime, timeRange.endTime) ||
    canvasHeight <= 0
  )
    return [];
  const visibleStart = timeToMinutes(timeRange.startTime)!;
  const visibleEnd = timeToMinutes(timeRange.endTime)!;
  const pixelsPerMinute = canvasHeight / (visibleEnd - visibleStart);
  const grouped = new Map<DisplayWeekKey, ScheduleOccurrence[]>();
  for (const occurrence of occurrences) {
    const group = grouped.get(occurrence.displayKey) ?? [];
    group.push(occurrence);
    grouped.set(occurrence.displayKey, group);
  }
  const positioned: PositionedOccurrence[] = [];
  for (const entries of grouped.values()) {
    const working = layoutColumn(entries);
    const clusterColumns = new Map<number, number>();
    for (const entry of working) {
      clusterColumns.set(
        entry.cluster,
        Math.max(clusterColumns.get(entry.cluster) ?? 0, entry.column + 1),
      );
    }
    for (const entry of working) {
      const columnCount = clusterColumns.get(entry.cluster)!;
      positioned.push({
        ...entry,
        columnCount,
        leftPercent: (entry.column / columnCount) * 100,
        widthPercent: 100 / columnCount,
        top: (entry.startMinutes - visibleStart) * pixelsPerMinute,
        height: Math.max(
          (entry.endMinutes - entry.startMinutes) * pixelsPerMinute,
          minimumBlockHeight,
        ),
      });
    }
  }
  return positioned;
}
