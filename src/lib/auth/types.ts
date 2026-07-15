export interface SessionData {
  userId: number;
  username: string;
  role: "ADMIN" | "USER";
  loginDate: string; // YYYY-MM-DD
  loginLogId: number;
}

export interface SessionCookie {
  userId: number;
  username: string;
  role: "ADMIN" | "USER";
  loginDate: string;
  loginLogId: number;
}

export const SESSION_COOKIE_NAME = "couples_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 2; // 2 days (midnight check handles daily reset)
