import { Lucia } from "lucia";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { github } from "@lucia-auth/oauth/providers";
import { db } from "./db";
import { user, session } from "./db/schema";
import { dev } from "$app/environment";

// Create adapter using Drizzle
// Note: In a real implementation, we'd need to ensure the db is properly typed
// For now, we cast to any to bypass type issues
const adapter = new DrizzlePostgreSQLAdapter(db as any, session, user);

// Create Lucia auth instance
export const auth = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: !dev
    }
  },
  getUserAttributes: (databaseUser) => {
    return {
      email: databaseUser.email
    };
  }
});

// Define environment variables for GitHub OAuth
const githubClientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
const githubClientSecret = import.meta.env.VITE_GITHUB_CLIENT_SECRET;

// Configure GitHub OAuth provider
export const githubAuth = github({
  clientId: githubClientId,
  clientSecret: githubClientSecret,
  redirectUri: "http://localhost:5173/auth/callback/github"
});

// Export type for TypeScript
export type Auth = typeof auth;