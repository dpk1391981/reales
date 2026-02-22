import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import {
  publishPropertyApi,
  saveDraftApi,
  updatePropertyApi,
  deletePropertyApi,
  browsePropertiesApi,
  getPropertyApi,
  getMyPropertiesApi,
  getPropertyQuotaApi,
  buyBoostApi,
  getActiveBoostsApi,
  cancelBoostApi,
  getWalletBalanceApi,
  getWalletTransactionsApi,
} from "@/services/propertyApi";

import type {
  PropertyPayload,
  DraftPayload,
  BrowseFilters,
} from "@/services/propertyApi";

/* ─────────────────────────────────────────────
   STATE TYPES
───────────────────────────────────────────── */

interface PropertyState {
  properties: any[];
  myProperties: any[];
  selectedProperty: any | null;

  quota: any | null;
  boosts: any[];

  walletBalance: any | null;
  walletTransactions: any[];

  loading: boolean;
  error: string | null;
}

const initialState: PropertyState = {
  properties: [],
  myProperties: [],
  selectedProperty: null,

  quota: null,
  boosts: [],

  walletBalance: null,
  walletTransactions: [],

  loading: false,
  error: null,
};

/* ─────────────────────────────────────────────
   THUNKS (FULLY TYPESAFE)
───────────────────────────────────────────── */

// ✅ Publish
export const publishProperty = createAsyncThunk<
  any,
  { payload: PropertyPayload; files: File[] },
  { rejectValue: string }
>("property/publish", async (args, { rejectWithValue }) => {
  try {
    const { data } = await publishPropertyApi(args.payload, args.files);
    return data;
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.message || "Publish failed");
  }
});

// ✅ Save Draft
export const saveDraft = createAsyncThunk<
  any,
  { payload: DraftPayload; files?: File[] },
  { rejectValue: string }
>("property/saveDraft", async (args, { rejectWithValue }) => {
  try {
    const { data } = await saveDraftApi(args.payload, args.files || []);
    return data;
  } catch {
    return rejectWithValue("Draft save failed");
  }
});

// ✅ Update
export const updateProperty = createAsyncThunk<
  any,
  { id: number; payload: Partial<PropertyPayload>; files?: File[] },
  { rejectValue: string }
>("property/update", async (args, { rejectWithValue }) => {
  try {
    const { data } = await updatePropertyApi(
      args.id,
      args.payload,
      args.files || [],
    );
    return data;
  } catch {
    return rejectWithValue("Update failed");
  }
});

// ✅ Delete
export const deleteProperty = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("property/delete", async (id, { rejectWithValue }) => {
  try {
    await deletePropertyApi(id);
    return id;
  } catch {
    return rejectWithValue("Delete failed");
  }
});

// ✅ Browse
export const browseProperties = createAsyncThunk<
  any,
  BrowseFilters | undefined,
  { rejectValue: string }
>("property/browse", async (filters, { rejectWithValue }) => {
  try {
    const { data } = await browsePropertiesApi(filters);
    return data;
  } catch {
    return rejectWithValue("Browse failed");
  }
});

// ✅ Get Single
export const getProperty = createAsyncThunk<
  any,
  string | number,
  { rejectValue: string }
>("property/getOne", async (idOrSlug, { rejectWithValue }) => {
  try {
    const { data } = await getPropertyApi(idOrSlug);
    return data;
  } catch {
    return rejectWithValue("Failed to fetch property");
  }
});

// ✅ My Properties
export const getMyProperties = createAsyncThunk<
  any,
  string | undefined,
  { rejectValue: string }
>("property/my", async (status, { rejectWithValue }) => {
  try {
    const { data } = await getMyPropertiesApi(status);
    return data;
  } catch {
    return rejectWithValue("Failed to fetch my properties");
  }
});

// ✅ Quota
export const getQuota = createAsyncThunk<any, void, { rejectValue: string }>(
  "property/quota",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getPropertyQuotaApi();
      return data;
    } catch {
      return rejectWithValue("Failed to fetch quota");
    }
  },
);

// ✅ Buy Boost
export const buyBoost = createAsyncThunk<
  any,
  { propertyId: number; packageId: number },
  { rejectValue: string }
>("property/buyBoost", async (args, { rejectWithValue }) => {
  try {
    const { data } = await buyBoostApi(args.propertyId, args.packageId);
    return data;
  } catch {
    return rejectWithValue("Boost purchase failed");
  }
});

// ✅ Get Boosts
export const getActiveBoosts = createAsyncThunk<
  any,
  number,
  { rejectValue: string }
>("property/boosts", async (propertyId, { rejectWithValue }) => {
  try {
    const { data } = await getActiveBoostsApi(propertyId);
    return data;
  } catch {
    return rejectWithValue("Failed to fetch boosts");
  }
});

// ✅ Cancel Boost
export const cancelBoost = createAsyncThunk<
  number,
  { propertyId: number; boostId: number },
  { rejectValue: string }
>("property/cancelBoost", async (args, { rejectWithValue }) => {
  try {
    await cancelBoostApi(args.propertyId, args.boostId);
    return args.boostId;
  } catch {
    return rejectWithValue("Cancel boost failed");
  }
});

// ✅ Wallet Balance
export const getWalletBalance = createAsyncThunk<
  any,
  void,
  { rejectValue: string }
>("property/walletBalance", async (_, { rejectWithValue }) => {
  try {
    const { data } = await getWalletBalanceApi();
    return data;
  } catch {
    return rejectWithValue("Failed to fetch wallet balance");
  }
});

// ✅ Wallet Transactions (FIXED TS1016)
export const getWalletTransactions = createAsyncThunk<
  any,
  { page?: number; limit?: number } | undefined,
  { rejectValue: string }
>("property/walletTransactions", async (params, { rejectWithValue }) => {
  try {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;

    const { data } = await getWalletTransactionsApi(page, limit);
    return data;
  } catch {
    return rejectWithValue("Failed to fetch transactions");
  }
});

/* ─────────────────────────────────────────────
   SLICE
───────────────────────────────────────────── */

const propertySlice = createSlice({
  name: "property",
  initialState,
  reducers: {
    clearSelectedProperty(state) {
      state.selectedProperty = null;
    },
    clearPropertyError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ✅ 1. ALL addCase FIRST

    builder.addCase(browseProperties.fulfilled, (state, action) => {
      state.properties = action.payload?.data || action.payload;
    });

    builder.addCase(getProperty.fulfilled, (state, action) => {
      state.selectedProperty = action.payload;
    });

    builder.addCase(getMyProperties.fulfilled, (state, action) => {
      state.myProperties = action.payload;
    });

    builder.addCase(deleteProperty.fulfilled, (state, action) => {
      state.myProperties = state.myProperties.filter(
        (p: any) => p.id !== action.payload,
      );
    });

    builder.addCase(getQuota.fulfilled, (state, action) => {
      state.quota = action.payload;
    });

    builder.addCase(getActiveBoosts.fulfilled, (state, action) => {
      state.boosts = action.payload;
    });

    builder.addCase(cancelBoost.fulfilled, (state, action) => {
      state.boosts = state.boosts.filter((b: any) => b.id !== action.payload);
    });

    builder.addCase(getWalletBalance.fulfilled, (state, action) => {
      state.walletBalance = action.payload;
    });

    builder.addCase(getWalletTransactions.fulfilled, (state, action) => {
      state.walletTransactions = action.payload;
    });

    // ✅ 2. MATCHERS LAST (VERY IMPORTANT)

    builder.addMatcher(
      (action): action is any =>
        action.type.startsWith("property/") && action.type.endsWith("/pending"),
      (state: PropertyState) => {
        state.loading = true;
        state.error = null;
      },
    );

    builder.addMatcher(
      (action): action is any =>
        action.type.startsWith("property/") &&
        action.type.endsWith("/rejected"),
      (state: PropertyState, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      },
    );

    builder.addMatcher(
      (action): action is any =>
        action.type.startsWith("property/") &&
        action.type.endsWith("/fulfilled"),
      (state: PropertyState) => {
        state.loading = false;
      },
    );
  },
});

export const { clearSelectedProperty, clearPropertyError } =
  propertySlice.actions;

export default propertySlice.reducer;
