import type { OrderItem, OrderItemCreate, OrderResponse } from "../types/api";
import api from "./axios";

export async function getMyOrders(
  skip = 0,
  limit = 10
): Promise<OrderResponse[]> {
  const response = await api.get<OrderResponse[]>("/users/me/orders", {
    params: { skip, limit },
  });
  return response.data;
}

export async function getOrder(orderId: number): Promise<OrderResponse> {
  const response = await api.get<OrderResponse>(`/orders/${orderId}`);
  return response.data;
}

export async function getOrderItems(orderId: number): Promise<OrderItem[]> {
  const response = await api.get<OrderItem[]>(`/orders/${orderId}/items`);
  return response.data;
}

export async function createOrder(
  items: OrderItemCreate[]
): Promise<OrderResponse> {
  const response = await api.post<OrderResponse>("/orders", items);
  return response.data;
}

export async function cancelOrder(orderId: number): Promise<OrderResponse> {
  const response = await api.patch<OrderResponse>(
    `/orders/${orderId}/cancel`
  );
  return response.data;
}

export async function completeOrder(orderId: number): Promise<OrderResponse> {
  const response = await api.patch<OrderResponse>(
    `/orders/${orderId}/complete`
  );
  return response.data;
}
