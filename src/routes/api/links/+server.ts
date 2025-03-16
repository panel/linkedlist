import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as services from '$lib/server/services';

// GET /api/links - Get all links
export const GET: RequestHandler = async () => {
  try {
    const links = await services.getLinks();
    return json(links);
  } catch (error) {
    console.error('Error fetching links:', error);
    return json({ error: 'Failed to fetch links' }, { status: 500 });
  }
};

// POST /api/links - Create a new link
export const POST: RequestHandler = async ({ request }) => {
  try {
    const linkData = await request.json();
    const newLink = await services.createLink(linkData);
    return json(newLink);
  } catch (error) {
    console.error('Error creating link:', error);
    return json({ error: 'Failed to create link' }, { status: 500 });
  }
};