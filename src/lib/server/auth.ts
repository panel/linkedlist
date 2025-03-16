/**
 * Authentication utilities - mock implementation for local development
 * This will be replaced with Lucia auth in the future
 */

import type { RequestEvent } from '@sveltejs/kit';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import { getCurrentUser } from '$lib/mock/data';

// Mock session token duration
const DAY_IN_MS = 1000 * 60 * 60 * 24;
export const sessionCookieName = 'auth-session';

// Generate a random session token
export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	const token = encodeBase64url(bytes);
	return token;
}

// Mock create session - doesn't actually store in DB
export async function createSession(token: string, userId: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + DAY_IN_MS * 30)
	};
	
	// In real implementation, this would store in the database
	return session;
}

// Mock session validation
export async function validateSessionToken(token: string) {
	// For development, always return the current mock user
	const mockUser = getCurrentUser();
	
	// Create a simulated session
	const mockSession = {
		id: 'mock-session-id',
		userId: mockUser.id,
		expiresAt: new Date(Date.now() + DAY_IN_MS * 30)
	};

	return {
		session: mockSession,
		user: mockUser
	};
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

// Mock session invalidation
export async function invalidateSession(sessionId: string) {
	// Nothing to do in mock implementation
	return;
}

// Set the session cookie in the response
export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: '/'
	});
}

// Delete the session cookie
export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		path: '/'
	});
}
