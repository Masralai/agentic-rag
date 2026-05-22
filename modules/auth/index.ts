import { auth } from "@clerk/nextjs/server";
import type { AuthUser, AuthSession } from "./types";

export type { AuthUser, AuthSession } from "./types";

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await auth();
  if (!session.userId) return null;
  return { id: session.userId, email: "" };
}

export async function requireAuth(): Promise<AuthSession> {
  const session = await auth();
  if (!session.userId) throw new Error("Authentication required");
  return { userId: session.userId };
}

export async function getSessionId(): Promise<string | null> {
  const session = await auth();
  return session.userId ?? null;
}
