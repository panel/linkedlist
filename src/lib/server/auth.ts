/**
 * Authentication implementation for GitHub OAuth
 * This replaces the mock implementation with a real OAuth flow
 */

import { dev } from '$app/environment';
import type { RequestEvent } from '@sveltejs/kit';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import type { User } from '$lib/types';
import { env } from '$env/dynamic/private';

// Define Session interface for type safety
export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  fresh: boolean;  // Added this property to match SvelteKit's expected session structure
}

// Constants for auth configuration
// Use env directly for server-side code instead of import.meta.env
const GITHUB_CLIENT_ID = env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = "http://localhost:5173/auth/callback/github";
const DAY_IN_MS = 1000 * 60 * 60 * 24;

// Cookie names
export const sessionCookieName = 'auth-session';
export const stateCookieName = 'github-oauth-state';

// Generate a random state value for CSRF protection
export function generateState() {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  const state = encodeBase64url(bytes);
  return state;
}

// Generate a random session token
export function generateSessionToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  const token = encodeBase64url(bytes);
  return token;
}

// Create session - this would normally store in DB
export async function createSession(token: string, userId: string): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + DAY_IN_MS * 30),
    fresh: true // New sessions are fresh
  };
  
  // In a real implementation, this would store in the database
  return session;
}

// Create GitHub OAuth URL for login
export function createGitHubAuthUrl() {
  const state = generateState();
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", GITHUB_CLIENT_ID);
  url.searchParams.set("redirect_uri", GITHUB_REDIRECT_URI);
  url.searchParams.set("state", state);
  url.searchParams.set("scope", "user:email");
  
  return { url: url.toString(), state };
}

// Exchange code for GitHub access token
export async function getGitHubAccessToken(code: string) {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: GITHUB_REDIRECT_URI
    })
  });
  
  const data = await response.json();
  return data.access_token;
}

// Get GitHub user data using access token
export async function getGitHubUser(accessToken: string) {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  });
  
  return await response.json();
}

// Get GitHub user emails using access token
export async function getGitHubUserEmails(accessToken: string) {
  const response = await fetch("https://api.github.com/user/emails", {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  });
  
  return await response.json();
}

// Find or create user from GitHub data
export async function findOrCreateUserFromGitHub(githubUser: any, emails: any[]) {
  // Find primary email
  const primaryEmail = emails.find(email => email.primary)?.email || emails[0]?.email || `${githubUser.login}@github.com`;
  
  // In a real implementation, this would check if the user exists in the database
  // and create a new user if not found
  const user: User = {
    id: `github-${githubUser.id}`,
    email: primaryEmail,
    createdAt: new Date()
  };
  
  return user;
}

// Create a new auth session from GitHub OAuth flow
export async function createSessionFromGitHubAuth(code: string, state: string, storedState: string) {
  if (!state || !storedState || state !== storedState) {
    throw new Error("Invalid state parameter");
  }
  
  const accessToken = await getGitHubAccessToken(code);
  if (!accessToken) {
    throw new Error("Failed to get GitHub access token");
  }
  
  const githubUser = await getGitHubUser(accessToken);
  const emails = await getGitHubUserEmails(accessToken);
  
  const user = await findOrCreateUserFromGitHub(githubUser, emails);
  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, user.id);
  
  return { session, user, sessionToken };
}

// Mock session validation (for now)
export async function validateSessionToken(token: string) {
  // For real implementation, this would validate against the database
  // For now, we can create a very simple mock version
  try {
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    // Create a fake session and user
    const mockSession: Session = {
      id: sessionId,
      userId: "github-123456",
      expiresAt: new Date(Date.now() + DAY_IN_MS * 30),
      fresh: false // Existing sessions are not fresh
    };
    
    const mockUser = {
      id: "github-123456",
      email: "user@example.com",
      createdAt: new Date()
    };
    
    return {
      session: mockSession,
      user: mockUser
    };
  } catch (error) {
    return { session: null, user: null };
  }
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

// Mock session invalidation
export async function invalidateSession(sessionId: string) {
  // In a real implementation, this would delete the session from the database
  return;
}

// Set the session cookie in the response
export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
  event.cookies.set(sessionCookieName, token, {
    expires: expiresAt,
    path: '/',
    httpOnly: true,
    secure: !dev,
    sameSite: 'lax'
  });
}

// Set a temporary state cookie for OAuth
export function setStateCookie(event: RequestEvent, state: string) {
  event.cookies.set(stateCookieName, state, {
    maxAge: 60 * 10, // 10 minutes
    path: '/',
    httpOnly: true,
    secure: !dev,
    sameSite: 'lax'
  });
}

// Delete the session cookie
export function deleteSessionTokenCookie(event: RequestEvent) {
  event.cookies.delete(sessionCookieName, {
    path: '/'
  });
}

// Delete the state cookie
export function deleteStateCookie(event: RequestEvent) {
  event.cookies.delete(stateCookieName, {
    path: '/'
  });
}
