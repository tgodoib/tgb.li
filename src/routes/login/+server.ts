import { redirect } from '@sveltejs/kit';
import { OAuth2RequestError, generateState } from 'arctic';
import { github, lucia } from '$lib/server/auth';
import { dev } from '$app/environment';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server';
import { userTable } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import { generateId } from 'lucia';

export async function GET(event: RequestEvent): Promise<Response> {
	const code = event.url.searchParams.get('code');

	if (!code) {
		const state = generateState();
		const url = await github.createAuthorizationURL(state);

		event.cookies.set('github_oauth_state', state, {
			path: '/',
			secure: !dev,
			httpOnly: true,
			maxAge: 60 * 10,
			sameSite: 'lax'
		});

		redirect(302, url.toString());
	} else {
		const state = event.url.searchParams.get('state');
		const storedState = event.cookies.get('github_oauth_state') ?? null;

		if (!code || !state || !storedState || state !== storedState) {
			console.log(!code, !state, !storedState, state !== storedState);
			return new Response(null, {
				status: 400
			});
		}

		try {
			const tokens = await github.validateAuthorizationCode(code);
			const githubUserResponse = await fetch('https://api.github.com/user', {
				headers: {
					Authorization: `Bearer ${tokens.accessToken}`
				}
			});

			const githubUser: GitHubUser = await githubUserResponse.json();
			const existingUser = await db
				.select()
				.from(userTable)
				.where(eq(userTable.github_id, githubUser.id));

			if (existingUser.length > 0) {
				const session = await lucia.createSession(existingUser[0].id, {});
				const sessionCookie = lucia.createSessionCookie(session.id);

				event.cookies.set(sessionCookie.name, sessionCookie.value, {
					path: '.',
					...sessionCookie.attributes
				});
			} else {
				const userId = generateId(15);

				await db
					.insert(userTable)
					.values({ id: userId, github_id: githubUser.id, username: githubUser.login });

				const session = await lucia.createSession(userId, {});
				const sessionCookie = lucia.createSessionCookie(session.id);

				event.cookies.set(sessionCookie.name, sessionCookie.value, {
					path: '.',
					...sessionCookie.attributes
				});
			}

			return new Response(null, { status: 302, headers: { Location: '/' } });
		} catch (e) {
			console.log(e);
			if (e instanceof OAuth2RequestError) {
				return new Response(null, { status: 400 });
			}
			return new Response(null, { status: 500 });
		}
	}
}

interface GitHubUser {
	id: number;
	login: string;
}
