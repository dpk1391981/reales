// src/store/slices/locationSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  getCountriesApi,
  getStatesApi,
  getCitiesApi,
  getLocalitiesApi,
  type LocationOption,
} from "@/services/locationApi";

/* ─────────────────────────────────────────────
   STATE
───────────────────────────────────────────── */

interface LocationState {
  country_id: number;
  state_id: number;
  city_id: number;
  locality_id: number;
  locality: string;

  countries: LocationOption[];
  states: LocationOption[];
  cities: LocationOption[];
  localities: LocationOption[];

  loadingCountries: boolean;
  loadingStates: boolean;
  loadingCities: boolean;
  loadingLocalities: boolean;

  loadedCountries: boolean;
}

const initialState: LocationState = {
  country_id: 0,
  state_id: 0,
  city_id: 0,
  locality_id: 0,
  locality: "",

  countries: [],
  states: [],
  cities: [],
  localities: [],

  loadingCountries: false,
  loadingStates: false,
  loadingCities: false,
  loadingLocalities: false,

  loadedCountries: false,
};

/* ─────────────────────────────────────────────
   THUNKS
───────────────────────────────────────────── */

/* Load Countries (Only Once) */
export const fetchCountries = createAsyncThunk(
  "location/fetchCountries",
  async (_, { getState, rejectWithValue }) => {
    const state: any = getState();

    if (state.location.loadedCountries) return null;

    try {
      const res = await getCountriesApi();
      return res.data; // <-- IMPORTANT FIX
    } catch (err) {
      return rejectWithValue("Failed to load countries");
    }
  }
);

/* Load States */
export const fetchStates = createAsyncThunk(
  "location/fetchStates",
  async (country_id: number, { rejectWithValue }) => {
    try {
      const res = await getStatesApi(country_id);
      return res.data;
    } catch (err) {
      return rejectWithValue("Failed to load states");
    }
  }
);

/* Load Cities */
export const fetchCities = createAsyncThunk(
  "location/fetchCities",
  async (state_id: number, { rejectWithValue }) => {
    try {
      const res = await getCitiesApi(state_id);
      return res.data;
    } catch (err) {
      return rejectWithValue("Failed to load cities");
    }
  }
);

/* Load Localities */
export const fetchLocalities = createAsyncThunk(
  "location/fetchLocalities",
  async (city_id: number, { rejectWithValue }) => {
    try {
      const res = await getLocalitiesApi(city_id);
      return res.data;
    } catch (err) {
      return rejectWithValue("Failed to load localities");
    }
  }
);

/* ─────────────────────────────────────────────
   SLICE
───────────────────────────────────────────── */

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    selectCountry(state, action: PayloadAction<number>) {
      state.country_id = action.payload;

      state.state_id = 0;
      state.city_id = 0;
      state.locality_id = 0;
      state.locality = "";

      state.states = [];
      state.cities = [];
      state.localities = [];
    },

    selectState(state, action: PayloadAction<number>) {
      state.state_id = action.payload;

      state.city_id = 0;
      state.locality_id = 0;
      state.locality = "";

      state.cities = [];
      state.localities = [];
    },

    selectCity(state, action: PayloadAction<number>) {
      state.city_id = action.payload;

      state.locality_id = 0;
      state.locality = "";
      state.localities = [];
    },

    selectLocality(state, action: PayloadAction<LocationOption>) {
      state.locality_id = action.payload.id;
      state.locality = action.payload.name;
    },

    setLocalityText(state, action: PayloadAction<string>) {
      state.locality_id = 0;
      state.locality = action.payload;
    },

    restoreLocation(
      state,
      action: PayloadAction<{
        country_id: number;
        state_id: number;
        city_id: number;
        locality_id: number;
        locality: string;
      }>
    ) {
      return { ...state, ...action.payload };
    },
  },

  extraReducers: (builder) => {
    builder

      /* COUNTRIES */
      .addCase(fetchCountries.pending, (state) => {
        state.loadingCountries = true;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        if (!action.payload) return;

        state.countries = action.payload;
        state.loadingCountries = false;
        state.loadedCountries = true;

        // ✅ Default Country = India
        const india = action.payload.find(
          (c) => c.name.toLowerCase() === "india"
        );

        if (india) {
          state.country_id = india.id;
        }
      })
      .addCase(fetchCountries.rejected, (state) => {
        state.loadingCountries = false;
      })

      /* STATES */
      .addCase(fetchStates.pending, (state) => {
        state.loadingStates = true;
      })
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.states = action.payload;
        state.loadingStates = false;
      })
      .addCase(fetchStates.rejected, (state) => {
        state.loadingStates = false;
      })

      /* CITIES */
      .addCase(fetchCities.pending, (state) => {
        state.loadingCities = true;
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.cities = action.payload;
        state.loadingCities = false;
      })
      .addCase(fetchCities.rejected, (state) => {
        state.loadingCities = false;
      })

      /* LOCALITIES */
      .addCase(fetchLocalities.pending, (state) => {
        state.loadingLocalities = true;
      })
      .addCase(fetchLocalities.fulfilled, (state, action) => {
        state.localities = action.payload;
        state.loadingLocalities = false;
      })
      .addCase(fetchLocalities.rejected, (state) => {
        state.loadingLocalities = false;
      });
  },
});

export const {
  selectCountry,
  selectState,
  selectCity,
  selectLocality,
  setLocalityText,
  restoreLocation,
} = locationSlice.actions;

export default locationSlice.reducer;