"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTaxonomy, type TaxonomyResponse } from "@/services/taxonomy.service";
import { normalizeError } from "@/errors/normalizeError";

type TaxonomyState = Omit<TaxonomyResponse, "success">;

const EMPTY: TaxonomyState = {
  levels: [],
  departments: [],
  goals: [],
  audienceTags: [],
  wildcard: "All",
};

export const TAXONOMY_KEY = ["taxonomy"] as const;

export function useTaxonomy() {
  const { data, isLoading, isError, error: rawError, refetch } = useQuery({
    queryKey: TAXONOMY_KEY,
    queryFn: fetchTaxonomy,
    // Departments/levels/tags change rarely — no need to revalidate on
    // every focus/mount the way book data does.
    staleTime: 5 * 60_000,
  });

  return {
    ...(data ?? EMPTY),
    isLoading,
    isError,
    error: isError ? normalizeError(rawError) : null,
    refetch,
  };
}
