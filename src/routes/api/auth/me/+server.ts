import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { User } from '$lib/types';

export const GET: RequestHandler = async ({ locals }) => {
  // Check if the user is authenticated
  if (locals.user && locals.session) {
    // Cast the user to our application User type to access fields
    const appUser = locals.user as User;
    
    return json({
      authenticated: true,
      user: {
        id: appUser.id,
        email: appUser.email
      }
    });
  }
  
  // User is not authenticated
  return json({
    authenticated: false,
    user: null
  });
};