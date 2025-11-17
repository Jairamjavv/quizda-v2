import { Context } from "hono";
import { getDb } from "../../db";
import { setAuthCookies } from "../../utils/cookies";
import { validateRegisterInput, type RegisterInput } from "../validation";
import type { Env } from "../../types";
import { UserRepository } from "../../repositories";
import { AuthenticationService } from "../../services";

export async function handleRegister(c: Context<{ Bindings: Env }>) {
  try {
    const input: RegisterInput = await c.req.json();

    // Validate input
    const validation = validateRegisterInput(input);
    if (!validation.isValid) {
      return c.json({ error: validation.error }, 400);
    }

    // Get database and initialize repository & service
    const db = getDb(c.env);
    const userRepo = new UserRepository(db);
    const authService = new AuthenticationService(userRepo);

    // Register user through service layer
    const result = await authService.register({
      firebaseUid: input.firebaseUid,
      email: input.email,
      username: input.username,
      password: input.password,
      role: validation.role as "admin" | "contributor" | "attempter",
    });

    // Create response with user data
    const response = c.json(
      {
        message: result.message,
        user: result.user,
        token: result.token,
      },
      201
    );

    // Set authentication cookies
    const isProduction = c.env.ENVIRONMENT === "production";
    return setAuthCookies(response, result.token, result.token, isProduction);
  } catch (error: any) {
    console.error("Registration error:", error);
    return c.json(
      { error: error.message || "Registration failed" },
      error.message?.includes("already exists") ? 400 : 500
    );
  }
}
