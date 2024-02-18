import { dev } from '$app/environment';
import { Lucia } from 'lucia';
import { adapter } from '.';
import { GitHub } from 'arctic';

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			// set to `true` when using HTTPS
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => {
		return {
			username: attributes.username,
			admin: attributes.admin,
			githubId: attributes.github_id
		};
	}
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface DatabaseUserAttributes {
	username: string;
	admin: boolean;
	github_id: number;
}

export const github = new GitHub(
	import.meta.env._GITHUB_CLIENT_ID,
	import.meta.env._GITHUB_CLIENT_SECRET
);
