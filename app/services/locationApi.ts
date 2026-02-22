// src/services/locationApi.ts
// ─────────────────────────────────────────────────────────────────────────────
// Cascading location endpoints: Country → State → City → Locality
// All responses return { id, name } arrays for use in dropdowns.
// ─────────────────────────────────────────────────────────────────────────────

import axiosInstance from "@/lib/axiosConfig";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface LocationOption {
  id:   number;
  name: string;
}

// ─── ENDPOINTS ────────────────────────────────────────────────────────────────

/** GET /locations/countries  →  [{ id, name }] */
export const getCountriesApi = () =>
  axiosInstance.get<LocationOption[]>("/locations/countries");

/** GET /locations/states?country_id=1  →  [{ id, name }] */
export const getStatesApi = (countryId: number) =>
  axiosInstance.get<LocationOption[]>("/locations/states", {
    params: { country_id: countryId },
  });

/** GET /locations/cities?state_id=5  →  [{ id, name }] */
export const getCitiesApi = (stateId: number) =>
  axiosInstance.get<LocationOption[]>("/locations/cities", {
    params: { state_id: stateId },
  });

/** GET /locations/localities?city_id=22  →  [{ id, name }] */
export const getLocalitiesApi = (cityId: number) =>
  axiosInstance.get<LocationOption[]>("/locations/localities", {
    params: { city_id: cityId },
  });