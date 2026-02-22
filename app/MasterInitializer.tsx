"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMasters } from "@/store/slices/masterSlice";
import {
  fetchCountries,
  fetchStates,
} from "@/store/slices/locationSlice";

export default function MasterInitializer() {
  const dispatch = useAppDispatch();
  const hasFetched = useRef(false);

  const country_id = useAppSelector(
    (s: any) => s.location?.country_id
  );

  useEffect(() => {
    if (hasFetched.current) return;

    hasFetched.current = true;

    dispatch(fetchMasters());
    dispatch(fetchCountries());
  }, [dispatch]);

  // Auto load states when India auto-selected
  useEffect(() => {
    if (country_id) {
      dispatch(fetchStates(country_id));
    }
  }, [country_id, dispatch]);

  return null;
}