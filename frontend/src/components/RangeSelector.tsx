type Props = {
  rangeDays: number;
  onChange: (d: number) => void;
};

export function RangeSelector({ rangeDays, onChange }: Props) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {[1, 7, 30].map((d) => (
        <button
          key={d}
          onClick={() => onChange(d)}
          style={{
            padding: "6px 10px",
            fontWeight: rangeDays === d ? 700 : 400,
          }}
        >
          {d} {d === 1 ? "day" : "days"}
        </button>
      ))}
    </div>
  );
}
