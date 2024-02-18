import type { RequestHandler } from './$types';
import { db } from '$lib/server';
import { urls } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params }) => {
	const query = await db.select().from(urls).where(eq(urls.id, params.id));

	if (query.length > 0) {
		return Response.redirect(query[0].url);
	}

	return Response.redirect('https://tiagogb.dev.br');
};
