// src/store/slices/propertySlice.ts
// ─────────────────────────────────────────────────────────────────────────────
// Redux slice for property operations.
//
// Critical: saveDraft and publishProperty thunks receive a `files` argument
// (File[]) and pass it directly to the API layer. Redux actions are
// NOT serializable with File objects — we thread them through the thunk
// without ever storing them in Redux state (they live only in component state).
// ─────────────────────────────────────────────────────────────────────────────

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  getPropertyApi,
  saveDraftApi,
  publishPropertyApi,
  deletePropertyApi,
  browsePropertiesApi,
  getMyPropertiesApi,
  type PropertyPayload,
  type DraftPayload,
  type BrowseFilters,
} from "@/services/propertyApi";

// ─── State ────────────────────────────────────────────────────────────────────

interface PropertyState {
  selectedProperty: any | null;
  myListings:       any[];
  browseResults:    any[];
  loading:          boolean;
  error:            string | null;
}

const initialState: PropertyState = {
  selectedProperty: null,
  myListings:       [],
  browseResults:    [],
  loading:          false,
  error:            null,
};

// ─── THUNKS ───────────────────────────────────────────────────────────────────

/**
 * GET /properties/:idOrSlug
 * Loads a single property for the edit/view form.
 * Returns the raw API response so the form can call apiToForm() on it.
 */
export const getProperty = createAsyncThunk(
  "property/getOne",
  async (idOrSlug: string | number, { rejectWithValue }) => {
    try {
      const res = await getPropertyApi(idOrSlug);
      return res.data;
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.error   ??
        err?.message                 ??
        "Failed to load property";
      return rejectWithValue(
        Array.isArray(msg) ? msg.join("; ") : msg
      );
    }
  }
);

/**
 * PUT /properties/draft
 * Auto-save or manual-save a draft.
 * Does NOT consume quota or wallet tokens.
 *
 * ⚠️ files (File[]) is passed as a thunk argument — it never goes into Redux
 *    state because File objects are not serializable.
 */
export const saveDraft = createAsyncThunk(
  "property/saveDraft",
  async (
    { payload, files = [] }: { payload: DraftPayload; files?: File[] },
    { rejectWithValue }
  ) => {
    try {
      const res = await saveDraftApi(payload, files);
      return res.data;
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.error   ??
        err?.message                 ??
        "Failed to save draft";
      return rejectWithValue(
        Array.isArray(msg) ? msg.join("; ") : msg
      );
    }
  }
);

/**
 * POST /properties
 * Publish a listing. Consumes agent quota or owner wallet token.
 *
 * ⚠️ Same note as saveDraft — files never stored in Redux state.
 */
export const publishProperty = createAsyncThunk(
  "property/publish",
  async (
    { payload, files = [] }: { payload: PropertyPayload; files?: File[] },
    { rejectWithValue }
  ) => {
    try {
      const res = await publishPropertyApi(payload, files);
      return res.data;
    } catch (err: any) {
      // NestJS validation errors come as an array in message
      const raw = err?.response?.data?.message;
      const msg =
        Array.isArray(raw)
          ? raw.join("\n• ")
          : raw ?? err?.response?.data?.error ?? err?.message ?? "Failed to publish";
      return rejectWithValue(msg);
    }
  }
);

/**
 * DELETE /properties/:id
 * Soft-delete a listing.
 */
export const deleteProperty = createAsyncThunk(
  "property/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      const res = await deletePropertyApi(id);
      return { id, ...res.data };
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message ?? err?.message ?? "Failed to delete"
      );
    }
  }
);

/**
 * GET /properties/my
 * Fetch authenticated user's own listings.
 */
export const fetchMyListings = createAsyncThunk(
  "property/myListings",
  async (status: string | undefined, { rejectWithValue }) => {
    try {
      const res = await getMyPropertiesApi(status);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message ?? err?.message ?? "Failed to load listings"
      );
    }
  }
);

/**
 * GET /properties
 * Public browse with filters.
 */
export const browseProperties = createAsyncThunk(
  "property/browse",
  async (filters: BrowseFilters | undefined, { rejectWithValue }) => {
    try {
      const res = await browsePropertiesApi(filters);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message ?? err?.message ?? "Failed to browse"
      );
    }
  }
);

// ─── SLICE ────────────────────────────────────────────────────────────────────

const propertySlice = createSlice({
  name: "property",
  initialState,
  reducers: {
    /** Call this on form unmount to prevent stale data leaking between sessions */
    clearSelectedProperty(state) {
      state.selectedProperty = null;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── getProperty ──────────────────────────────────────────────────────────
    builder
      .addCase(getProperty.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(getProperty.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading          = false;
        // Store the raw property; form calls apiToForm() on the thunk result directly
        state.selectedProperty = action.payload?.data ?? action.payload ?? null;
      })
      .addCase(getProperty.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });

    // ── saveDraft ────────────────────────────────────────────────────────────
    builder
      .addCase(saveDraft.pending, (state) => {
        state.error = null;
      })
      .addCase(saveDraft.fulfilled, (state, action: PayloadAction<any>) => {
        // Update selectedProperty if it's the same draft
        const returned = action.payload?.data ?? action.payload;
        if (returned?.id && state.selectedProperty?.id === returned.id) {
          state.selectedProperty = returned;
        }
      })
      .addCase(saveDraft.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // ── publishProperty ──────────────────────────────────────────────────────
    builder
      .addCase(publishProperty.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(publishProperty.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading          = false;
        state.selectedProperty = action.payload?.data ?? action.payload ?? null;
      })
      .addCase(publishProperty.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });

    // ── deleteProperty ───────────────────────────────────────────────────────
    builder
      .addCase(deleteProperty.fulfilled, (state, action: PayloadAction<any>) => {
        state.myListings = state.myListings.filter(p => p.id !== action.payload.id);
      });

    // ── fetchMyListings ──────────────────────────────────────────────────────
    builder
      .addCase(fetchMyListings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyListings.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading    = false;
        state.myListings = action.payload?.data ?? action.payload ?? [];
      })
      .addCase(fetchMyListings.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });

    // ── browseProperties ─────────────────────────────────────────────────────
    builder
      .addCase(browseProperties.pending, (state) => {
        state.loading = true;
      })
      .addCase(browseProperties.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading       = false;
        state.browseResults = action.payload?.data ?? action.payload ?? [];
      })
      .addCase(browseProperties.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });
  },
});

export const { clearSelectedProperty, clearError } = propertySlice.actions;
export default propertySlice.reducer;