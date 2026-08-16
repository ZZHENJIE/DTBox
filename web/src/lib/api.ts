import { getAccessToken, refreshAccessToken } from "./tauri";
import i18n from "~/i18n";
import type { ApiResponse } from "~/types/api";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

let cachedToken: string | null = null;
let tokenPromise: Promise<string> | null = null;

function loadToken(): Promise<string> {
  if (cachedToken) return Promise.resolve(cachedToken);
  if (!tokenPromise) {
    tokenPromise = getAccessToken()
      .then((token) => {
        cachedToken = token;
        return token;
      })
      .finally(() => {
        tokenPromise = null;
      });
  }
  return tokenPromise;
}

export function clearTokenCache(): void {
  cachedToken = null;
}

async function refreshToken(): Promise<void> {
  const token = await refreshAccessToken();
  cachedToken = token;
}

async function doFetch(
  path: string,
  init: RequestInit,
  withAuth: boolean,
  allowRetry: boolean,
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (withAuth) {
    const token = await loadToken();
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(path, { ...init, headers });

  if (response.status === 401 && withAuth && allowRetry) {
    await refreshToken();
    return doFetch(path, init, withAuth, false);
  }

  return response;
}

async function extractError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiResponse<unknown>;
    if (body && typeof body.message === "string" && body.message) {
      return body.message;
    }
  } catch {
    // ignore parse errors
  }
  return i18n.t("errors.requestFailed", { status: response.status });
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  withAuth = true,
): Promise<T> {
  const response = await doFetch(path, init, withAuth, true);

  if (!response.ok) {
    throw new ApiError(await extractError(response), response.status);
  }

  const body = (await response.json()) as ApiResponse<T>;
  if (!body.success) {
    throw new ApiError(body.message ?? i18n.t("errors.unknown"), response.status);
  }
  return body.data as T;
}

export async function apiBlob(
  path: string,
  init: RequestInit = {},
  withAuth = true,
): Promise<Blob> {
  const response = await doFetch(path, init, withAuth, true);

  if (!response.ok) {
    throw new ApiError(await extractError(response), response.status);
  }

  return response.blob();
}
