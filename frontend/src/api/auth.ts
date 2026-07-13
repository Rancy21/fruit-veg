import api, { setAuthToken } from "./axios";
import type { LoginResponse, PasswordChange, User, UserCreate, UserUpdate } from "../types/api";

export async function register(user: UserCreate): Promise<User> {
  const response = await api.post<User>("/auth/register", user);
  return response.data;
}

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);

  const response = await api.post<LoginResponse>("/auth/token", params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  setAuthToken(response.data.access_token);
  return response.data;
}

export async function getMe(): Promise<User> {
  const response = await api.get<User>("/users/me");
  return response.data;
}

export async function updateMe(data: UserUpdate): Promise<User> {
  const response = await api.patch<User>("/users/me", data);
  return response.data;
}

export async function changePassword(data: PasswordChange): Promise<void> {
  await api.patch("/users/me/password", data);
}
