import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { api } from "../lib/api";
import { EventList, Event } from "../components/EventList";
import { RangeSelector } from "../components/RangeSelector";
import { AddEventForm } from "../components/AddEventForm";

export default function Main() {
  const navigate = useNavigate();
  const [rangeDays, setRangeDays] = useState(7);
  const [start, setStart] = useState(dayjs().startOf("day"));
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.get(
        `/api/events?rangeDays=${rangeDays}&start=${start.toISOString()}`
      );
      setEvents(
        data.events.map((e: any) => ({
          id: e.id,
          title: e.title,
          start: e.start,
          end: e.end,
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [rangeDays, start.toISOString()]);

  async function refresh() {
    await api.post("/api/events/refresh");
    await load();
  }

  async function create(v: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
  }) {
    try {
      await api.post("/api/events", v);
      await load();
    } catch (err: any) {
      alert(`Failed to create event: ${err.message || "Unknown error"}`);
      throw err;
    }
  }

  async function deleteEvent(eventId: string) {
    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }
    try {
      await api.delete(`/api/events/${eventId}`);
      await load();
    } catch (err: any) {
      alert(`Failed to delete event: ${err.message || "Unknown error"}`);
    }
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
      navigate("/login");
    } catch (err: any) {
      console.error("Logout error:", err);
      // Still redirect to login even if logout fails
      navigate("/login");
    }
  }

  const heading = useMemo(() => {
    const end = start.add(rangeDays - 1, "day");
    return `${start.format("MMM D, YYYY")} → ${end.format("MMM D, YYYY")}`;
  }, [start, rangeDays]);

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: "0 16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h2 style={{ margin: 0 }}>My Events</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={refresh}
            disabled={loading}
            style={{ padding: "8px 12px" }}
          >
            Refresh from Google
          </button>
          <button onClick={logout} style={{ padding: "8px 12px" }}>
            Logout
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <RangeSelector rangeDays={rangeDays} onChange={setRangeDays} />
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={() => setStart((s) => s.subtract(rangeDays, "day"))}>
            {"<"}
          </button>
          <div style={{ padding: "6px 8px" }}>{heading}</div>
          <button onClick={() => setStart((s) => s.add(rangeDays, "day"))}>
            {">"}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <AddEventForm onCreate={create} />
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <EventList
          events={events}
          rangeDays={rangeDays}
          onDelete={deleteEvent}
        />
      )}
    </div>
  );
}
