import type { SearchResponse } from "../types/api";
import api from "./axios";

export async function aiSearch(query: string): Promise<SearchResponse> {
  const response = await api.post<SearchResponse>("/search", { query });
  return response.data;
}
