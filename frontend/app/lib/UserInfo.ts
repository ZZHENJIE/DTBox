import type { UserInfo } from "./API/User";

const STORAGE_KEY = "user_info";

export function getUserInfo(): UserInfo | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as UserInfo;
  } catch (error) {
    console.error("Failed to parse user info:", error);
    return null;
  }
}

export function setUserInfo(userInfo: UserInfo): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userInfo));
  } catch (error) {
    console.error("Failed to save user info:", error);
  }
}

export function updateUserInfo(partial: Partial<UserInfo>): void {
  const current = getUserInfo() || ({} as UserInfo);
  const updated = { ...current, ...partial };
  setUserInfo(updated as UserInfo);
}

export function clearUserInfo(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function isLoggedIn(): boolean {
  return getUserInfo() !== null;
}

export function getUserField<K extends keyof UserInfo>(
  key: K,
): UserInfo[K] | undefined {
  const user = getUserInfo();
  return user?.[key];
}
