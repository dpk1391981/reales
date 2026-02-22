import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getFullMasterApi } from "@/services/categoryApi";

interface MasterState {
  categories: any[];
  subcategories: any[];
  configTypes: any[];
  listingTypes: any[];
  amenities: any[];
  loading: boolean;
  loaded: boolean;
}

const initialState: MasterState = {
  categories: [],
  subcategories: [],
  configTypes: [],
  listingTypes: [],
  amenities: [],
  loading: false,
  loaded: false,
};

/* ─────────────────────────────────────────────
   LOAD FULL MASTER
───────────────────────────────────────────── */
export const fetchMasters = createAsyncThunk(
  "masters/fetchMasters",
  async (_, { getState, rejectWithValue }) => {
    const state: any = getState();

    if (state.masters.loaded) {
      return null; // skip API call
    }

    try {
      const { data } = await getFullMasterApi();
      const categoryList = data || [];

      // ✅ Flatten subcategories
      const allSubcategories = categoryList.flatMap((cat: any) =>
        (cat.subcategories || []).map((sub: any) => ({
          ...sub,
          categoryId: cat.id,
        }))
      );

      // ✅ Flatten listing types
      const rawListingTypes = categoryList.flatMap(
        (cat: any) => cat.listing_types || []
      );

      // ✅ Flatten amenties types
      const rawAmenities = categoryList.flatMap(
        (cat: any) => cat.amenities || []
      );

      // ✅ Deduplicate listing types by ID
      const listingTypesMap = new Map();
      rawListingTypes.forEach((lt: any) => {
        if (!listingTypesMap.has(lt.id)) {
          listingTypesMap.set(lt.id, lt);
        }
      });

      const amenities = new Map();
      rawAmenities.forEach((lt: any) => {
        if (!amenities.has(lt.id)) {
          amenities.set(lt.id, lt);
        }
      });

      const uniqueListingTypes = Array.from(listingTypesMap.values());
      const uniqueAmenities = Array.from(amenities.values());

      // ✅ Flatten config types
      const allConfigTypes = allSubcategories.flatMap((sub: any) =>
        (sub.config_types || []).map((cfg: any) => ({
          ...cfg,
          subcategoryId: sub.id,
        }))
      );

      return {
        categories: categoryList,
        subcategories: allSubcategories,
        configTypes: allConfigTypes,
        listingTypes: uniqueListingTypes,
        amenities: uniqueAmenities,
      };
    } catch (err) {
      return rejectWithValue("Failed to load masters");
    }
  }
);

const masterSlice = createSlice({
  name: "masters",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMasters.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMasters.fulfilled, (state, action) => {
        if (!action.payload) return;

        state.categories = action.payload.categories;
        state.subcategories = action.payload.subcategories;
        state.configTypes = action.payload.configTypes;
        state.listingTypes = action.payload.listingTypes;
        state.amenities = action.payload.amenities;

        state.loading = false;
        state.loaded = true;
      })
      .addCase(fetchMasters.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default masterSlice.reducer;