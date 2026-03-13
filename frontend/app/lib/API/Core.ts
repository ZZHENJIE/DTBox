import { toast } from "sonner";
import JWTToken from "../JWTToken";

interface Response<T> {
  status: globalThis.Response;
  value: {
    code: number;
    message: string | null;
    data: T | null;
  };
}

export function ResponseToast<T>(response: Response<T>) {
  switch (response.value.code) {
    case 0: {
      return toast.success("Success");
    }
    case -2: {
      return toast.error("Database find error!");
    }
    case -3: {
      return toast.error("Database write error!");
    }
    case -4: {
      return toast.error("Hash error!");
    }
    case -5: {
      return toast.error("Cookie get error!");
    }
    case -6: {
      return toast.error("Parse error!");
    }
    case -301: {
      return toast.error("User is not exists!");
    }
    case -302: {
      return toast.error("Password error!");
    }
    default: {
      return toast.error(response.value.message);
    }
  }
}

export async function Get<T>(url: string, is_auth: boolean = false) {
  const response = await fetch(url, {
    headers: {
      ...(is_auth ? { Authorization: `Bearer ${JWTToken.Get()}` } : {}),
    },
  });
  const result: Response<T> = {
    status: response,
    value: await response.json(),
  };
  return result;
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
  const result: Response<T> = {
    status: response,
    value: await response.json(),
  };
  return result;
}
