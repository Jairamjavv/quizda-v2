import { Hono } from "hono";
import type { Env } from "../types";
import {
  handleRegister,
  handleLogin,
  handleGetMe,
  handleLogout,
  handleRefreshToken,
} from "./handlers";

/**
 * Worker-compatible auth routes with session management
 * Uses D1 for storage, Web Crypto API for password hashing,
 * and HTTP-only cookies for secure session management
 */
const workerAuth = new Hono<{ Bindings: Env }>();

workerAuth.post("/register", handleRegister);
workerAuth.post("/login", handleLogin);
workerAuth.get("/me", handleGetMe);
workerAuth.post("/logout", handleLogout);
workerAuth.post("/refresh", handleRefreshToken);

export default workerAuth;
