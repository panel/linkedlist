import { createGitHubAuthUrl } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies, url, locals }) => {
  // Generate GitHub OAuth URL with state parameter
  const { url: authUrl, state } = createGitHubAuthUrl();
  
  // Log the auth URL (for debugging)
  console.log('GitHub Auth URL:', authUrl);
  
  // Store state in a cookie for CSRF protection
  cookies.set('github-oauth-state', state, {
    path: '/',
    secure: import.meta.env.PROD,
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    sameSite: 'lax'
  });
  
  // Redirect to GitHub authorization page using Response object
  return new Response(null, {
    status: 302,
    headers: {
      Location: authUrl
    }
  });
};