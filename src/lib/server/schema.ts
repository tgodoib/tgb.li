import { text, sqliteTable, integer } from 'drizzle-orm/sqlite-core';

export const urls = sqliteTable('urls', {
	id: text('id').primaryKey(),
	url: text('url').notNull(),
	owner: text('owner')
		.notNull()
		.references(() => userTable.id)
});

export const userTable = sqliteTable('user', {
	id: text('id').notNull().primaryKey(),
	username: text('email').notNull(),
	admin: integer('admin').default(0),
	github_id: integer('github_id').unique()
});

export const sessionTable = sqliteTable('session', {
	id: text('id').notNull().primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => userTable.id),
	expiresAt: integer('expires_at').notNull()
});
