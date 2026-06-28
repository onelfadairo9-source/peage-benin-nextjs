export const CITY_IDS = [
  "cotonou",
  "porto_novo",
  "bohicon",
  "abomey",
  "parakou",
  "kandi",
  "djougou",
  "natitingou",
] as const;

export type CityId = (typeof CITY_IDS)[number];

export interface City {
  id: CityId;
  name: string;
  region: string;
  /** Coordonnées sur la carte SVG (viewBox 0 0 460 620). */
  x: number;
  y: number;
}

export const CITIES: City[] = [
  { id: "cotonou", name: "Cotonou", region: "Littoral", x: 250, y: 565 },
  { id: "porto_novo", name: "Porto-Novo", region: "Ouémé", x: 332, y: 532 },
  { id: "bohicon", name: "Bohicon", region: "Zou", x: 232, y: 430 },
  { id: "abomey", name: "Abomey", region: "Zou", x: 232, y: 392 },
  { id: "parakou", name: "Parakou", region: "Borgou", x: 240, y: 250 },
  { id: "kandi", name: "Kandi", region: "Alibori", x: 285, y: 148 },
  { id: "djougou", name: "Djougou", region: "Donga", x: 165, y: 182 },
  { id: "natitingou", name: "Natitingou", region: "Atacora", x: 128, y: 108 },
];

export function cityName(id: string): string {
  return CITIES.find((c) => c.id === id)?.name ?? id;
}

export interface VehicleType {
  id: string;
  name: string;
  icon: string;
  /** Tarif par porte de péage (FCFA). */
  rate: number;
  description: string;
}

export const VEHICLE_TYPES: VehicleType[] = [
  {
    id: "car",
    name: "Voiture / 4x4",
    icon: "🚗",
    rate: 500,
    description: "Véhicule particulier, 2 essieux",
  },
  {
    id: "bus",
    name: "Bus / Minibus",
    icon: "🚌",
    rate: 800,
    description: "Transport en commun",
  },
  {
    id: "truck",
    name: "Poids lourd",
    icon: "🚚",
    rate: 1200,
    description: "Camion, 3 essieux et plus",
  },
];

export function vehicleName(id: string): string {
  return VEHICLE_TYPES.find((v) => v.id === id)?.name ?? id;
}

export function vehicleRate(id: string): number {
  return VEHICLE_TYPES.find((v) => v.id === id)?.rate ?? 500;
}

export interface TollStation {
  id: string;
  name: string;
  city: string;
  highway: string;
  tollA: string;
  tollB: string;
}

/** Postes de péage du réseau inter-États du Bénin. */
export const STATIONS: TollStation[] = [
  {
    id: "pahou",
    name: "Péage de Pahou",
    city: "Cotonou",
    highway: "RNIE 1",
    tollA: "Cotonou",
    tollB: "Ouidah",
  },
  {
    id: "akassato",
    name: "Péage d'Akassato",
    city: "Abomey-Calavi",
    highway: "RNIE 2",
    tollA: "Cotonou",
    tollB: "Bohicon",
  },
  {
    id: "glazoue",
    name: "Péage de Glazoué",
    city: "Glazoué",
    highway: "RNIE 2",
    tollA: "Bohicon",
    tollB: "Parakou",
  },
  {
    id: "savalou",
    name: "Péage de Savalou",
    city: "Savalou",
    highway: "RNIE 2",
    tollA: "Bohicon",
    tollB: "Parakou",
  },
  {
    id: "pira",
    name: "Péage de Pira",
    city: "Tchaourou",
    highway: "RNIE 2",
    tollA: "Parakou",
    tollB: "Bohicon",
  },
  {
    id: "bemberke",
    name: "Péage de Bembèrèkè",
    city: "Bembèrèkè",
    highway: "RNIE 2",
    tollA: "Parakou",
    tollB: "Kandi",
  },
];

export function stationName(id: string): string {
  return STATIONS.find((s) => s.id === id)?.name ?? id;
}

export interface PaymentMethod {
  id: string;
  name: string;
  short: string;
  color: string;
  bg: string;
  emoji: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "mtn",
    name: "MTN Mobile Money",
    short: "MTN MoMo",
    color: "#FFCC00",
    bg: "#000000",
    emoji: "📱",
  },
  {
    id: "moov",
    name: "Moov Money",
    short: "Moov",
    color: "#00B0EF",
    bg: "#003C71",
    emoji: "📲",
  },
  {
    id: "celtiis",
    name: "Celtiis Cash",
    short: "Celtiis",
    color: "#E2231A",
    bg: "#7A0F0A",
    emoji: "💸",
  },
  {
    id: "card",
    name: "Carte bancaire",
    short: "Visa / Mastercard",
    color: "#6366F1",
    bg: "#1E1B4B",
    emoji: "💳",
  },
];

export function paymentName(id: string): string {
  return PAYMENT_METHODS.find((p) => p.id === id)?.name ?? id;
}

export const APP_NAME = "Péage Bénin";
export const APP_TAGLINE = "Réseau National de Péage de la République du Bénin";
