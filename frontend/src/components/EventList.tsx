import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(weekOfYear);

export type Event = { id: string; title: string; start: string; end: string };

function groupByDay(events: Event[]) {
  const map = new Map<string, Event[]>();
  for (const e of events) {
    const key = dayjs(e.start).format("YYYY-MM-DD");
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

function groupByWeek(events: Event[]) {
  const map = new Map<string, Event[]>();
  for (const e of events) {
    const d = dayjs(e.start);
    const week = d.week();
    const year = d.year();
    // Adjust year for weeks that span year boundaries (week 1 might be in previous year)
    const weekYear =
      week === 1 && d.month() === 11
        ? year + 1
        : week === 52 && d.month() === 0
        ? year - 1
        : year;
    const key = `${weekYear}-W${String(week).padStart(2, "0")}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

function getWeekRange(events: Event[]): string {
  if (events.length === 0) return "Week";

  // Find the earliest event date in the week
  const earliest = events.reduce((earliest, e) => {
    const current = dayjs(e.start);
    return current.isBefore(earliest) ? current : earliest;
  }, dayjs(events[0].start));

  // Calculate week start (Sunday) and end (Saturday)
  const weekStart = earliest.startOf("week");
  const weekEnd = weekStart.add(6, "day");

  const startMonth = weekStart.format("MMMM");
  const startDay = weekStart.date();
  const endMonth = weekEnd.format("MMMM");
  const endDay = weekEnd.date();
  const year = weekStart.year();

  // Format: "November 17th - 24th of 2025" or "November 17th - December 1st of 2025"
  const startSuffix = getOrdinalSuffix(startDay);
  const endSuffix = getOrdinalSuffix(endDay);

  if (startMonth === endMonth) {
    return `Week ${startMonth} ${startDay}${startSuffix} - ${endDay}${endSuffix} of ${year}`;
  } else {
    return `Week ${startMonth} ${startDay}${startSuffix} - ${endMonth} ${endDay}${endSuffix} of ${year}`;
  }
}

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export function EventList({
  events,
  rangeDays,
  onDelete,
}: {
  events: Event[];
  rangeDays: number;
  onDelete?: (eventId: string) => void;
}) {
  const grouped = rangeDays === 30 ? groupByWeek(events) : groupByDay(events);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {grouped.map(([groupKey, evs]) => (
        <div key={groupKey}>
          <h4 style={{ margin: "12px 0" }}>
            {rangeDays === 30
              ? getWeekRange(evs)
              : dayjs(groupKey).format("dddd, MMM D")}
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {evs
              .sort(
                (a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf()
              )
              .map((e) => (
                <div
                  key={e.id}
                  style={{
                    padding: 12,
                    border: "1px solid #eee",
                    borderRadius: 6,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{e.title}</div>
                    <div style={{ color: "#444" }}>
                      {dayjs(e.start).format("HH:mm")} –{" "}
                      {dayjs(e.end).format("HH:mm")}
                    </div>
                  </div>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(e.id)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 14,
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "#c82333";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "#dc3545";
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
