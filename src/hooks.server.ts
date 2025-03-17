import type { Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth.js';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';
import type { User } from '$lib/types';

export const handle: Handle = async ({ event, resolve }) => {
  // Get the session token from cookies
  const sessionToken = event.cookies.get('auth-session');
  
  // Initialize with no session/user
  event.locals.user = null;
  event.locals.session = null;
  
  if (sessionToken) {
    try {
      // Validate the session token
      const { session, user } = await auth.validateSessionToken(sessionToken);
      
      if (session && user) {
        // If the session is valid and not expired, set session and user in locals
        if (session.expiresAt > new Date()) {
          // Set the session and user in locals
          event.locals.session = session;
          event.locals.user = user;
          
          // If using a real database, you might want to update the session expiration here
        }
      }
    } catch (error) {
      console.error('Error validating session:', error);
      // Delete the cookie on error
      event.cookies.delete('auth-session', { path: '/' });
    }
  }
  
  // Continue with the request
  return resolve(event);
};
