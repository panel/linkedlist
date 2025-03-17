import { invalidateSession } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, cookies }) => {
  // Check if user is logged in
  if (locals.session) {
    // Invalidate the session (in a real implementation, this would clear from the database)
    await invalidateSession(locals.session.id);
  }
  
  // Clear the session cookie directly
  cookies.delete('auth-session', { path: '/' });
  
  // Remove user and session from locals
  locals.user = null;
  locals.session = null;
  
  console.log('User logged out');
  
  // Redirect to login page
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/login'
    }
  });
};