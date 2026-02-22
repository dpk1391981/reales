import { useEffect, useState } from "react";
import {
  getCategoriesApi,
  getSubCategoriesApi,
  getConfigTypesApi,
  CategoryOption,
  SubCategoryOption,
  ConfigTypeOption,
} from "@/services/categoryApi";

export function useCategories() {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategoryOption[]>([]);
  const [configTypes, setConfigTypes] = useState<ConfigTypeOption[]>([]);

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSub, setLoadingSub] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);

  // ── Load categories on mount ─────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingCategories(true);
        const res = await getCategoriesApi();
        setCategories(res.data);
      } finally {
        setLoadingCategories(false);
      }
    };
    load();
  }, []);

  // ── Select Category ──────────────────────────────────────
  const selectCategory = async (id: number) => {
    try {
      setLoadingSub(true);
      setSubCategories([]);
      setConfigTypes([]);
      const res = await getSubCategoriesApi(id);
      setSubCategories(res.data);
    } finally {
      setLoadingSub(false);
    }
  };

  // ── Select SubCategory ───────────────────────────────────
  const selectSubCategory = async (id: number) => {
    try {
      setLoadingConfig(true);
      const res = await getConfigTypesApi(id);
      setConfigTypes(res.data);
    } finally {
      setLoadingConfig(false);
    }
  };

  return {
    categories,
    subCategories,
    configTypes,
    loadingCategories,
    loadingSub,
    loadingConfig,
    selectCategory,
    selectSubCategory,
  };
}