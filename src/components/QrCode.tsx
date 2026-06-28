function cyrb53(str: string, seed = 0) {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SIZE = 25;

/** Génère un motif type QR-code déterministe à partir d'une chaîne. */
export function QrCode({ value, size = 150 }: { value: string; size?: number }) {
  const rand = mulberry32(cyrb53(value));
  const cells: boolean[][] = [];
  for (let y = 0; y < SIZE; y++) {
    cells[y] = [];
    for (let x = 0; x < SIZE; x++) {
      cells[y][x] = rand() > 0.5;
    }
  }
  // Motifs de repérage aux 3 coins
  const finder = (ox: number, oy: number) => {
    for (let y = 0; y < 7; y++)
      for (let x = 0; x < 7; x++) {
        const edge = x === 0 || y === 0 || x === 6 || y === 6;
        const center = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        if (oy + y < SIZE && ox + x < SIZE) cells[oy + y][ox + x] = edge || center;
      }
    for (let y = -1; y <= 7; y++)
      for (let x = -1; x <= 7; x++) {
        const ny = oy + y;
        const nx = ox + x;
        if (
          ny >= 0 &&
          ny < SIZE &&
          nx >= 0 &&
          nx < SIZE &&
          !(y >= 0 && y <= 6 && x >= 0 && x <= 6)
        ) {
          cells[ny][nx] = false;
        }
      }
  };
  finder(0, 0);
  finder(SIZE - 7, 0);
  finder(0, SIZE - 7);

  const unit = size / SIZE;
  const rects: string[] = [];
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++)
      if (cells[y][x]) rects.push(`M${x} ${y}h1v1h-1z`);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Code de passage ${value}`}
    >
      <rect width={SIZE} height={SIZE} fill="#fff" />
      <path d={rects.join("")} fill="#1a1416" />
    </svg>
  );
}
