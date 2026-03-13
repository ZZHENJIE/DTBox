import JWTToken from "../../../app/lib/JWTToken";

interface Response<T> {
  code: number;
  message: string | null;
  data: T | null;
}

export async function Version() {
  const response = await fetch("/api/version");
  const data = (await response.json()) as Response<string>;
  if (data.code == 0) {
    return data.data;
  }
  return null;
}

export class User {
  public async Logout() {
    const response = await fetch("/api/users/logout", {
      body: JSON.stringify({}),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JWTToken.Get()}`,
      },
    });
    const data = (await response.json()) as Response<null>;
    if (data.code == 0) {
      return data.data;
    }
    return null;
  }
  public async Login(name: string, password: string) {
    const body = { name, password };
    const response = await fetch("/api/users/login", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = (await response.json()) as Response<number>;
    if (data.code == 0) {
      return data.data;
    }
    return null;
  }

  public async Refresh() {
    const response = await fetch("/api/users/refresh", {
      body: JSON.stringify({}),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = (await response.json()) as Response<string>;
    if (data.code == 0) {
      JWTToken.Set(data.data!);
      return data.data;
    }
    return null;
  }

  public async Info() {
    const response = await fetch("/api/users/info", {
      headers: {
        Authorization: `Bearer ${JWTToken.Get()}`,
      },
    });
    const data = (await response.json()) as Response<object>;
    if (data.code == 0) {
      return data.data;
    }
    return null;
  }

  public async ConfigChange(config: object) {
    const body = { type: "Config", data: config };
    const response = await fetch("/api/users/change", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JWTToken.Get()}`,
      },
    });
    const data = (await response.json()) as Response<boolean>;
    if (data.code == 0) {
      return data.data;
    }
    return null;
  }

  public async NameChange(name: string) {
    const body = { type: "Name", data: name };
    const response = await fetch("/api/users/change", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JWTToken.Get()}`,
      },
    });
    const data = (await response.json()) as Response<boolean>;
    if (data.code == 0) {
      return data.data;
    }
    return null;
  }
}
