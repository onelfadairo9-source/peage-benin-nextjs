import { CITY_IDS, type CityId, vehicleRate } from "./constants";

/** Réseau routier : villes connectées avec leur distance (km). */
const ROADS: Record<string, Array<[string, number]>> = {
  cotonou: [
    ["porto_novo", 55],
    ["bohicon", 125],
  ],
  porto_novo: [
    ["cotonou", 55],
    ["bohicon", 95],
  ],
  bohicon: [
    ["cotonou", 125],
    ["porto_novo", 95],
    ["abomey", 10],
  ],
  abomey: [
    ["bohicon", 10],
    ["parakou", 290],
  ],
  parakou: [
    ["abomey", 290],
    ["kandi", 130],
    ["djougou", 140],
  ],
  kandi: [["parakou", 130]],
  djougou: [
    ["parakou", 140],
    ["natitingou", 100],
  ],
  natitingou: [["djougou", 100]],
};

function isCityId(v: string): v is CityId {
  return (CITY_IDS as readonly string[]).includes(v);
}

/** Plus courte distance (km) entre deux villes (Dijkstra). */
export function getDistance(from: string, to: string): number {
  if (!isCityId(from) || !isCityId(to)) return 0;
  if (from === to) return 0;
  const dist: Record<string, number> = {};
  for (const c of CITY_IDS) dist[c] = Infinity;
  dist[from] = 0;
  const visited = new Set<string>();
  while (visited.size < CITY_IDS.length) {
    let current: string | null = null;
    let best = Infinity;
    for (const c of CITY_IDS) {
      if (!visited.has(c) && dist[c] < best) {
        best = dist[c];
        current = c;
      }
    }
    if (current === null || best === Infinity) break;
    visited.add(current);
    for (const [neighbor, w] of ROADS[current] ?? []) {
      const alt = dist[current] + w;
      if (alt < dist[neighbor]) dist[neighbor] = alt;
    }
  }
  return Number.isFinite(dist[to]) ? dist[to] : 0;
}

/** Liste ordonnée des villes traversées entre from et to. */
export function getPath(from: string, to: string): string[] {
  if (!isCityId(from) || !isCityId(to)) return [];
  if (from === to) return [from];
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  for (const c of CITY_IDS) {
    dist[c] = Infinity;
    prev[c] = null;
  }
  dist[from] = 0;
  const visited = new Set<string>();
  while (visited.size < CITY_IDS.length) {
    let current: string | null = null;
    let best = Infinity;
    for (const c of CITY_IDS) {
      if (!visited.has(c) && dist[c] < best) {
        best = dist[c];
        current = c;
      }
    }
    if (current === null || best === Infinity) break;
    visited.add(current);
    for (const [neighbor, w] of ROADS[current] ?? []) {
      const alt = dist[current] + w;
      if (alt < dist[neighbor]) {
        dist[neighbor] = alt;
        prev[neighbor] = current;
      }
    }
  }
  const path: string[] = [];
  let cur: string | null = to;
  while (cur) {
    path.unshift(cur);
    cur = prev[cur] ?? null;
  }
  if (path[0] !== from) return [from, to];
  return path;
}

/** Nombre de portes de péage franchies selon la distance. */
export function getGates(distance: number): number {
  return Math.max(1, Math.ceil(distance / 100));
}

export interface PriceQuote {
  distance: number;
  gates: number;
  rate: number;
  amount: number;
  path: string[];
}

export function calculatePrice(
  from: string,
  to: string,
  vehicleType: string,
): PriceQuote {
  const distance = getDistance(from, to);
  const gates = getGates(distance);
  const rate = vehicleRate(vehicleType);
  return {
    distance,
    gates,
    rate,
    amount: gates * rate,
    path: getPath(from, to),
  };
}
