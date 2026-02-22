// src/hooks/useLocation.ts
// ─────────────────────────────────────────────────────────────────────────────
// Cascading location hook:  Country → State → City → Locality
//
// Rules:
//  • Changing country  → resets state, city, locality selections + their lists
//  • Changing state    → resets city, locality selections + their lists
//  • Changing city     → resets locality selection + list
//  • Each tier fetches only when its parent id is set (> 0)
//  • Locality is free-text fallback when the API list is empty
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import {
  getCountriesApi,
  getStatesApi,
  getCitiesApi,
  getLocalitiesApi,
  type LocationOption,
} from "@/services/locationApi";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface LocationState {
  // selected IDs (sent to API)
  country_id:  number;
  state_id:    number;
  city_id:     number;
  locality_id: number;   // 0 = free-text mode
  locality:    string;   // free-text or name of selected locality

  // dropdown lists
  countries:  LocationOption[];
  states:     LocationOption[];
  cities:     LocationOption[];
  localities: LocationOption[];

  // per-tier loading flags
  loadingCountries:  boolean;
  loadingStates:     boolean;
  loadingCities:     boolean;
  loadingLocalities: boolean;
}

export interface LocationActions {
  selectCountry:  (id: number) => void;
  selectState:    (id: number) => void;
  selectCity:     (id: number) => void;
  selectLocality: (id: number) => void;
  setLocalityText:(text: string) => void;   // free-text override
  /** Restore from a persisted draft (all IDs already known) */
  restoreLocation: (ids: { country_id: number; state_id: number; city_id: number; locality_id: number; locality: string }) => void;
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export function useLocation(): LocationState & LocationActions {
  const [country_id,  setCountryId]  = useState(0);
  const [state_id,    setStateId]    = useState(0);
  const [city_id,     setCityId]     = useState(0);
  const [locality_id, setLocalityId] = useState(0);
  const [locality,    setLocality]   = useState("");

  const [countries,  setCountries]  = useState<LocationOption[]>([]);
  const [states,     setStates]     = useState<LocationOption[]>([]);
  const [cities,     setCities]     = useState<LocationOption[]>([]);
  const [localities, setLocalities] = useState<LocationOption[]>([]);

  const [loadingCountries,  setLoadingCountries]  = useState(false);
  const [loadingStates,     setLoadingStates]     = useState(false);
  const [loadingCities,     setLoadingCities]     = useState(false);
  const [loadingLocalities, setLoadingLocalities] = useState(false);

  // ── Load countries once on mount ────────────────────────────────────────────
  useEffect(() => {
    setLoadingCountries(true);
    getCountriesApi()
      .then(res => setCountries(res.data))
      .catch(() => {})
      .finally(() => setLoadingCountries(false));
  }, []);

  // ── Fetch states when country changes ───────────────────────────────────────
  useEffect(() => {
    if (!country_id) { setStates([]); return; }
    setLoadingStates(true);
    getStatesApi(country_id)
      .then(res => setStates(res.data))
      .catch(() => setStates([]))
      .finally(() => setLoadingStates(false));
  }, [country_id]);

  // ── Fetch cities when state changes ─────────────────────────────────────────
  useEffect(() => {
    if (!state_id) { setCities([]); return; }
    setLoadingCities(true);
    getCitiesApi(state_id)
      .then(res => setCities(res.data))
      .catch(() => setCities([]))
      .finally(() => setLoadingCities(false));
  }, [state_id]);

  // ── Fetch localities when city changes ──────────────────────────────────────
  useEffect(() => {
    if (!city_id) { setLocalities([]); return; }
    setLoadingLocalities(true);
    getLocalitiesApi(city_id)
      .then(res => setLocalities(res.data))
      .catch(() => setLocalities([]))
      .finally(() => setLoadingLocalities(false));
  }, [city_id]);

  // ── Actions ──────────────────────────────────────────────────────────────────

  const selectCountry = useCallback((id: number) => {
    setCountryId(id);
    // Reset all children
    setStateId(0);  setCities([]);
    setCityId(0);   setLocalities([]);
    setLocalityId(0); setLocality("");
  }, []);

  const selectState = useCallback((id: number) => {
    setStateId(id);
    // Reset children
    setCityId(0);   setLocalities([]);
    setLocalityId(0); setLocality("");
  }, []);

  const selectCity = useCallback((id: number) => {
    setCityId(id);
    // Reset children
    setLocalityId(0); setLocality("");
  }, []);

  const selectLocality = useCallback((id: number) => {
    setLocalityId(id);
    // Also store name as the free-text locality for display / API
    setLocalities(prev => {
      const found = prev.find(l => l.id === id);
      if (found) setLocality(found.name);
      return prev;
    });
  }, []);

  const setLocalityText = useCallback((text: string) => {
    setLocalityId(0);   // 0 = free-text mode
    setLocality(text);
  }, []);

  /** Called on mount to restore a draft that already has IDs */
  const restoreLocation = useCallback((ids: {
    country_id: number; state_id: number; city_id: number;
    locality_id: number; locality: string;
  }) => {
    setCountryId(ids.country_id);
    setStateId(ids.state_id);
    setCityId(ids.city_id);
    setLocalityId(ids.locality_id);
    setLocality(ids.locality);
    // The useEffects above will fire and re-fetch lists automatically
  }, []);

  return {
    country_id, state_id, city_id, locality_id, locality,
    countries, states, cities, localities,
    loadingCountries, loadingStates, loadingCities, loadingLocalities,
    selectCountry, selectState, selectCity, selectLocality,
    setLocalityText, restoreLocation,
  };
}