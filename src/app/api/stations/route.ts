import { STATIONS, CITIES, VEHICLE_TYPES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    stations: STATIONS,
    cities: CITIES,
    vehicleTypes: VEHICLE_TYPES,
  });
}
