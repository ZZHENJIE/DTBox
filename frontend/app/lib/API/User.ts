import { Get, Post } from "./Core";

export async function Exists(name: string) {
  const url = `/api/users/exists?name=${name}`;
  return await Get<boolean>(url);
}

export async function Register(name: string, password: string) {
  return await Post<boolean>("/api/users/register", {
    name,
    password,
  });
}

export async function Login(name: string, password: string) {
  return await Post<boolean>("/api/users/login", {
    name,
    password,
  });
}

export async function Logout() {
  return await Post<boolean>("/api/users/logout", {}, true);
}

export interface UserInfo {
  id: number;
  name: string;
  config: object;
  permissions: number;
  create_time: string;
}

export async function Info() {
  return await Get<UserInfo>("/api/users/info", true);
}

type ChangeType = "Name" | "Config";

export async function Change(type: ChangeType, data: object) {
  return await Post<boolean>("/api/users/change", {
    type,
    data,
  });
}

export async function Refresh() {
  return await Post<string>("/api/users/refresh", {}, true);
}
