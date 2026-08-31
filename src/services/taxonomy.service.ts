import { apiClient } from "@/api/axios";

export interface TaxonomyResponse {
  success: boolean;
  levels: string[];
  departments: string[];
  goals: string[];
  audienceTags: string[];
  wildcard: string;
}

export async function fetchTaxonomy(): Promise<TaxonomyResponse> {
  const { data } = await apiClient.get<TaxonomyResponse>("/taxonomy");
  return data;
}
