// place files you want to import through the `$lib` alias in this folder.
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { sessionTable, userTable } from './schema';

const sqlite = new Database('./src/sqlite.db');
export const db = drizzle(sqlite);
export const adapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable);
