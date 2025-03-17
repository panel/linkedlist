import { 
  createSessionFromGitHubAuth, 
  deleteStateCookie, 
  setSessionTokenCookie 
} from '$lib/server/auth';
import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies, locals, request }) => {
  // Get the state and code from the callback URL
  const state = url.searchParams.get('state');
  const code = url.searchParams.get('code');
  const storedState = cookies.get('github-oauth-state');
  
  // Debug log to check what we're receiving
  console.log('GitHub OAuth Callback:', { 
    state, 
    code: code?.substring(0, 5) + '...', 
    storedState 
  });
  
  // Validate the parameters
  if (!code || !state) {
    return error(400, 'Missing required parameters');
  }
  
  try {
    // Create a session from the GitHub auth flow
    const { user, session, sessionToken } = await createSessionFromGitHubAuth(
      code,
      state,
      storedState || ''
    );
    
    // Set the session cookie directly using the cookies object
    cookies.set('auth-session', sessionToken, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });
    
    // Delete the state cookie
    cookies.delete('github-oauth-state', { path: '/' });
    
    // Set user and session in locals for this request
    locals.user = user;
    locals.session = session;
    
    console.log('Auth successful, redirecting to home');
    
    // Redirect to the home page
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/'
      }
    });
  } catch (e) {
    console.error('Authentication error:', e);
    
    // Clean up the state cookie in case of error
    cookies.delete('github-oauth-state', { path: '/' });
    
    // Redirect to login page with error
    return new Response(null, {
      status: 302,
      headers: {
        Location: `/login?error=${encodeURIComponent('Authentication failed: ' + (e instanceof Error ? e.message : String(e)))}`
      }
    });
  }
};