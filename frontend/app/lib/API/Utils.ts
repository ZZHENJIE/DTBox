import { Get } from "./Core";

export async function Version() {
  const response = await Get<string>("/api/version");
  return response;
}
