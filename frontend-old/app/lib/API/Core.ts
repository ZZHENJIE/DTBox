import { toast } from "sonner";
import JWTToken from "../JWTToken";
import { Response } from "../Response";

export async function Get<T>(url: string, is_auth: boolean = false) {
  const response = await fetch(url, {
    headers: {
      ...(is_auth ? { Authorization: `Bearer ${JWTToken.Get()}` } : {}),
    },
  });
  const result = new Response<T>(await response.json());
  return result.onError(toast.error);
}

export async function Post<T>(
  url: string,
  body: object,
  is_auth: boolean = false,
) {
  const response = await fetch(url, {
    body: JSON.stringify(body),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(is_auth ? { Authorization: `Bearer ${JWTToken.Get()}` } : {}),
    },
  });
  const result = new Response<T>(await response.json());
  return result.onError(toast.error);
}
