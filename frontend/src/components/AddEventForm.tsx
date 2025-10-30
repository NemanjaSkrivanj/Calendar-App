import { useState } from "react";

type Props = {
  onCreate: (v: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
  }) => Promise<void>;
};

export function AddEventForm({ onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onCreate({ title, date, startTime, endTime });
      setTitle("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      style={{
        display: "grid",
        gap: 8,
        gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
        alignItems: "end",
      }}
    >
      <div>
        <label>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: "100%" }}
        />
      </div>
      <div>
        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          style={{ width: "100%" }}
        />
      </div>
      <div>
        <label>Start</label>
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
          style={{ width: "100%" }}
        />
      </div>
      <div>
        <label>End</label>
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
          style={{ width: "100%" }}
        />
      </div>
      <button
        disabled={submitting}
        type="submit"
        style={{ padding: "8px 12px" }}
      >
        Add
      </button>
    </form>
  );
}
