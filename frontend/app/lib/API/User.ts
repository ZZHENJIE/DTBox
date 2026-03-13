import { Get, Post } from "./Core";

export async function Exists(name: string) {
  const url = `/api/users/exists?name=${name}`;
  const response = await Get<boolean>(url);
  return response;
}

export async function Register(name: string, password: string) {
  const response = await Post<boolean>("/api/users/register", {
    name,
    password,
  });
  return response;
}

export async function Login(name: string, password: string) {
  const response = await Post<boolean>("/api/users/login", {
    name,
    password,
  });
  return response;
}

export async function Info() {
  const response = await Get<boolean>("/api/users/info", true);
  return response;
}

type ChangeType = "Name" | "Config";

export async function Change(type: ChangeType, data: string) {
  const response = await Post<boolean>("/api/users/change", {
    type,
    data,
  });
  return response;
}
