import { invoke } from "@tauri-apps/api/core";

export function isTauri(): boolean {
  return (
    typeof window !== "undefined" && "__TAURI_INTERNALS__" in window
  );
}

export async function doLogin(name: string, password: string): Promise<string> {
  return invoke<string>("do_login", { name, password });
}

export async function doRegister(
  name: string,
  password: string,
): Promise<string> {
  return invoke<string>("do_register", { name, password });
}

export async function doLogout(): Promise<void> {
  await invoke("do_logout");
}

export async function getAccessToken(): Promise<string> {
  return invoke<string>("get_access_token");
}

export async function refreshAccessToken(): Promise<string> {
  return invoke<string>("refresh_access_token");
}

export async function getUserId(): Promise<string> {
  return invoke<string>("get_user_id");
}

export async function openUrl(url: string): Promise<void> {
  if (!isTauri()) {
    window.open(url, "_blank");
    return;
  }
  await invoke("open_url", { url });
}
