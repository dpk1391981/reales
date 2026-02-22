// src/services/categoryApi.ts
// ─────────────────────────────────────────────────────────────
// Masters API (Nested: Category → SubCategory → ConfigTypes)
// ─────────────────────────────────────────────────────────────

import axiosInstance from "@/lib/axiosConfig";

/* ─────────────────────────────────────────────────────────────
   TYPES (UPDATED FOR NESTED RESPONSE)
───────────────────────────────────────────────────────────── */

export interface ConfigTypeOption {
  id: number;
  name: string;
  slug?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface SubCategoryOption {
  id: number;
  name: string;
  slug: string;
  category_id: number;
  is_active?: boolean;
  sort_order?: number;
  config_types: ConfigTypeOption[];
}

export interface CategoryOption {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  is_active?: boolean;
  sort_order?: number;
  listing_types?: any[];
  subcategories: SubCategoryOption[];
}

/* FULL MASTER RESPONSE = ARRAY */
export type FullMasterResponse = CategoryOption[];

/* ─────────────────────────────────────────────────────────────
   ENDPOINTS
───────────────────────────────────────────────────────────── */

/* FULL MASTER (Primary API — recommended) */
export const getFullMasterApi = () =>
  axiosInstance.get<FullMasterResponse>("/masters/full");

/* OPTIONAL (If still used somewhere else) */

/* CATEGORY ONLY */
export const getCategoriesApi = () =>
  axiosInstance.get<CategoryOption[]>("/masters/categories");

/* SUBCATEGORY BY CATEGORY */
export const getSubCategoriesApi = (categoryId: number) =>
  axiosInstance.get<SubCategoryOption[]>(
    `/masters/categories/${categoryId}/subcategories`
  );

/* CONFIG TYPES */
export const getConfigTypesApi = (
  categoryId: number,
  subCategoryId?: number
) =>
  axiosInstance.get<ConfigTypeOption[]>("/masters/config-types", {
    params: {
      categoryId,
      subcategoryId: subCategoryId,
    },
  });