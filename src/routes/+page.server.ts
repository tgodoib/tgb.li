import { redirect, type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { lucia } from '$lib/server/auth';
import { db } from '$lib/server';
import { urls } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		//redirect(302, '/login');
		return {};
	}

	let res = await db.select().from(urls).where(eq(urls.owner, event.locals.user.id));

	return {
		username: event.locals.user.username,
		admin: event.locals.user.admin,
		urls: res
	};
};

export const actions = {
	logout: async (event) => {
		if (!event.locals.session) return fail(401);

		await lucia.invalidateSession(event.locals.session.id);
		const sessionCookie = lucia.createBlankSessionCookie();

		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/');
	},
	add: async ({ locals, request }): Promise<FormResponse> => {
		const data = await request.formData();
		let id = data.get('id')?.toString();
		const url = data.get('url')?.toString();

		if (url === undefined) {
			return {
				status: 'error',
				message: 'Please provide a url.'
			};
		}

		if (id === undefined || id === '') {
			id = '';
			const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');
			for (let i = 0; i < 3; i++) {
				let index = Math.floor(Math.random() * chars.length);
				let upper = Math.round(Math.random()) === 1;
				id += upper ? chars[index].toUpperCase() : chars[index];
			}
		}
		let check_id = await db.select().from(urls).where(eq(urls.id, id));
		if (check_id.length > 0) {
			return {
				status: 'error',
				message: 'This id is already in use, please choose another one.'
			};
		}

		try {
			new URL(url);
		} catch (e) {
			return {
				status: 'error',
				message: 'The url provided is invalid.'
			};
		}

		if (locals.user == undefined) {
			return {
				status: 'error',
				message: 'You have to be loged in to add an entry.'
			};
		}

		try {
			await db.insert(urls).values({ id, url, owner: locals.user.id });
		} catch (e) {
			console.log(e);
			return {
				status: 'error',
				message: 'Internal Error. Please, try again.'
			};
		}

		return {
			status: 'success',
			message: 'Successufully create new entry!'
		};
	},
	del: async ({ request }): Promise<FormResponse> => {
		let id = (await request.formData()).get('id')?.toString();

		if (id === undefined) {
			return {
				status: 'error',
				message: 'Please provide an id.'
			};
		}

		try {
			await db.delete(urls).where(eq(urls.id, id));
		} catch (e) {
			console.log(e);
			return {
				status: 'error',
				message: 'Internal Error. Please, try again.'
			};
		}

		return {
			status: 'success',
			message: 'Entry deleted.'
		};
	}
} satisfies Actions;

type FormResponse = {
	status: 'success' | 'error';
	message: string;
};
