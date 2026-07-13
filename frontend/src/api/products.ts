import type { Product, ProductCreate } from "../types/api";
import api from "./axios";

export async function getProducts(skip = 0, limit = 15): Promise<Product[]> {
  const response = await api.get<Product[]>("/products", {
    params: { skip, limit },
  });
  return response.data;
}

export async function getProductById(id: string): Promise<Product> {
  const response = await api.get<Product>(`/products/${id}`);
  return response.data;
}

export async function getProductByName(name: string): Promise<Product> {
  const response = await api.get<Product>(`/products/${name}`);
  return response.data;
}

export async function getProductsByCategory(
  category: string,
  skip = 0,
  limit = 15
): Promise<Product[]> {
  const response = await api.get<Product[]>(
    `/products/category/${encodeURIComponent(category)}`,
    {
      params: { skip, limit },
    }
  );
  return response.data;
}

export async function createProduct(product: ProductCreate): Promise<Product> {
  const response = await api.post<Product>("/products", product);
  return response.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}
