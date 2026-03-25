export async function Version() {
  const response = await fetch("/api/version");
  return await response.text();
}
