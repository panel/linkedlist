import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as services from '$lib/server/services';

// GET /api/labels - Get all labels
export const GET: RequestHandler = async () => {
  try {
    // Get the current user
    const user = await services.getCurrentUser();
    const labels = await services.getLabels(user.id);
    return json(labels);
  } catch (error) {
    console.error('Error fetching labels:', error);
    return json({ error: 'Failed to fetch labels' }, { status: 500 });
  }
};

// POST /api/labels - Create a new label
export const POST: RequestHandler = async ({ request }) => {
  try {
    const { name } = await request.json();
    const newLabel = await services.createLabel(name);
    return json(newLabel);
  } catch (error) {
    console.error('Error creating label:', error);
    return json({ error: 'Failed to create label' }, { status: 500 });
  }
};