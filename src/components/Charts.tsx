interface Datum {
  label: string;
  value: number;
}

const BAR_COLORS = ["#d50000", "#fcd116", "#008751", "#7c3aed", "#0ea5e9"];

/* ---------- Vertical bars ---------- */
export function BarChart({
  data,
  formatValue = (v) => String(v),
  height = 200,
}: {
  data: Datum[];
  formatValue?: (v: number) => string;
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => {
        const h = Math.max(2, (d.value / max) * (height - 36));
        return (
          <div key={i} className="group flex flex-1 flex-col items-center gap-2">
            <span className="text-[0.65rem] font-bold text-ink opacity-0 transition-opacity group-hover:opacity-100">
              {formatValue(d.value)}
            </span>
            <div className="relative flex w-full flex-1 items-end justify-center">
              <div
                className="w-full max-w-[42px] rounded-t-lg bg-gradient-to-t from-brand-dark to-brand transition-all duration-500 group-hover:from-brand group-hover:to-brand-light"
                style={{ height: `${(h / (height - 36)) * 100}%` }}
              />
            </div>
            <span className="truncate text-[0.65rem] font-medium text-ink-soft">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Donut ---------- */
export function Donut({
  data,
  formatValue = (v) => String(v),
}: {
  data: { label: string; value: number; color?: string }[];
  formatValue?: (v: number) => string;
}) {
  const total = data.reduce((a, d) => a + d.value, 0);
  const r = 56;
  const C = 2 * Math.PI * r;
  let offset = 0;

  if (total === 0) {
    return (
      <div className="grid h-[140px] place-items-center text-sm text-ink-soft">
        Aucune donnée
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <svg width="140" height="140" viewBox="0 0 140 140" className="shrink-0">
        <g transform="rotate(-90 70 70)">
          <circle cx="70" cy="70" r={r} fill="none" stroke="#f1e9e9" strokeWidth="16" />
          {data.map((d, i) => {
            const frac = d.value / total;
            const len = frac * C;
            const seg = (
              <circle
                key={i}
                cx="70"
                cy="70"
                r={r}
                fill="none"
                stroke={d.color ?? BAR_COLORS[i % BAR_COLORS.length]}
                strokeWidth="16"
                strokeDasharray={`${len} ${C - len}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += len;
            return seg;
          })}
        </g>
        <text
          x="70"
          y="66"
          textAnchor="middle"
          className="font-display"
          fontSize="11"
          fill="#7a6f73"
        >
          Total
        </text>
        <text
          x="70"
          y="82"
          textAnchor="middle"
          className="font-display"
          fontSize="15"
          fontWeight="700"
          fill="#1a1416"
        >
          {formatValue(total)}
        </text>
      </svg>
      <ul className="space-y-2">
        {data.map((d, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <span
              className="h-3 w-3 rounded-sm"
              style={{ background: d.color ?? BAR_COLORS[i % BAR_COLORS.length] }}
            />
            <span className="text-ink-soft">{d.label}</span>
            <span className="ml-auto font-bold text-ink">
              {Math.round((d.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Horizontal bars ---------- */
export function HBar({
  data,
  formatValue = (v) => String(v),
}: {
  data: Datum[];
  formatValue?: (v: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (data.length === 0)
    return (
      <div className="grid h-[120px] place-items-center text-sm text-ink-soft">
        Aucune donnée
      </div>
    );
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={i}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="truncate text-ink-soft">{d.label}</span>
            <span className="font-bold text-ink">{formatValue(d.value)}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-brand-soft/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-dark to-brand"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
