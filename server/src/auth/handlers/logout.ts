import { Context } from "hono";
import { clearAuthCookies } from "../../utils/cookies";
import type { Env } from "../../types";

export async function handleLogout(c: Context<{ Bindings: Env }>) {
  try {
    const response = c.json({ message: "Logged out successfully" });
    return clearAuthCookies(response);
  } catch (error: any) {
    console.error("Logout error:", error);
    return c.json({ error: "Logout failed" }, 500);
  }
}
