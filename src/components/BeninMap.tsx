import { CITIES, type City } from "@/lib/constants";
import { getPath } from "@/lib/pricing";

const EDGES: [string, string][] = [
  ["cotonou", "porto_novo"],
  ["cotonou", "bohicon"],
  ["porto_novo", "bohicon"],
  ["bohicon", "abomey"],
  ["abomey", "parakou"],
  ["parakou", "kandi"],
  ["parakou", "djougou"],
  ["djougou", "natitingou"],
];

const byId = new Map<string, City>(CITIES.map((c) => [c.id, c]));
const coord = (id: string) => byId.get(id)!;

// Silhouette stylisée du Bénin.
const COUNTRY =
  "M178 586 L296 586 Q330 566 332 538 L360 500 Q356 470 348 448 L356 410 Q330 372 300 332 L300 290 Q312 268 322 250 L362 210 Q392 188 402 168 L410 120 Q396 86 380 70 L330 50 Q280 38 250 40 L170 55 Q140 72 120 92 L96 140 Q104 176 110 200 L90 250 Q82 282 80 310 L110 360 Q132 384 150 400 L160 460 Q168 500 170 520 Z";

export function BeninMap({
  from,
  to,
  className = "",
}: {
  from?: string;
  to?: string;
  className?: string;
}) {
  const route =
    from && to && from !== to ? getPath(from, to) : [];
  const routeSet = new Set(route);
  const routePath = route
    .map((id, i) => {
      const c = coord(id);
      return `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`;
    })
    .join(" ");

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 460 620"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Carte du réseau de péage du Bénin"
      >
        <defs>
          <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" />
            <stop offset="1" stopColor="#fbeaea" />
          </linearGradient>
          <linearGradient id="routeGrad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#9d0000" />
            <stop offset="1" stopColor="#ff4d4d" />
          </linearGradient>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Pays */}
        <path d={COUNTRY} fill="url(#land)" stroke="rgba(213,0,0,0.18)" strokeWidth="2" />

        {/* Réseau routier (fond) */}
        {EDGES.map(([a, b], i) => {
          const ca = coord(a);
          const cb = coord(b);
          return (
            <line
              key={`e${i}`}
              x1={ca.x}
              y1={ca.y}
              x2={cb.x}
              y2={cb.y}
              stroke="#e6d3d3"
              strokeWidth="6"
              strokeLinecap="round"
            />
          );
        })}
        {EDGES.map(([a, b], i) => {
          const ca = coord(a);
          const cb = coord(b);
          return (
            <line
              key={`ed${i}`}
              x1={ca.x}
              y1={ca.y}
              x2={cb.x}
              y2={cb.y}
              stroke="#fff"
              strokeWidth="1.4"
              strokeDasharray="2 5"
              strokeLinecap="round"
            />
          );
        })}

        {/* Itinéraire sélectionné */}
        {routePath && (
          <>
            <path
              d={routePath}
              fill="none"
              stroke="url(#routeGrad)"
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              className="route-draw"
            />
            <circle r="5" fill="#FCD116" stroke="#fff" strokeWidth="1.5">
              <animateMotion
                dur="3.2s"
                repeatCount="indefinite"
                rotate="auto"
                path={routePath}
              />
            </circle>
          </>
        )}

        {/* Villes */}
        {CITIES.map((c) => {
          const active = routeSet.has(c.id);
          const isEnd = c.id === from || c.id === to;
          return (
            <g key={c.id}>
              {isEnd && (
                <circle
                  cx={c.x}
                  cy={c.y}
                  r="9"
                  fill="none"
                  stroke="#d50000"
                  strokeWidth="2"
                  className="pulse-ring"
                  style={{ color: "#d50000", transformOrigin: `${c.x}px ${c.y}px` }}
                />
              )}
              <circle
                cx={c.x}
                cy={c.y}
                r={active ? 6.5 : 4.5}
                fill={active ? "#d50000" : "#fff"}
                stroke={active ? "#9d0000" : "#d50000"}
                strokeWidth="2.5"
              />
              <text
                x={c.x}
                y={c.y - 12}
                textAnchor="middle"
                className="font-display"
                fontSize={active ? "13" : "11"}
                fontWeight={active ? "700" : "600"}
                fill={active ? "#9d0000" : "#7a6f73"}
              >
                {c.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
