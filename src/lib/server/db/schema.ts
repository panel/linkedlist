import { pgTable, uuid, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

// User entity
export const user = pgTable('user', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull()
});

// Session entity for authentication
export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

// Link entity
export const link = pgTable('link', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	url: text('url').notNull(),
	title: text('title').notNull(),
	description: text('description'),
	isPermanent: boolean('is_permanent').default(false).notNull(),
	isPublic: boolean('is_public').default(false).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull()
});

// Note entity
export const note = pgTable('note', {
	id: uuid('id').defaultRandom().primaryKey(),
	linkId: uuid('link_id')
		.notNull()
		.references(() => link.id),
	content: text('content').notNull(),
	isPublished: boolean('is_published').default(false).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull()
});

// Label entity
export const label = pgTable('label', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	name: text('name').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull()
});

// LinkLabel junction table
export const linkLabel = pgTable('link_label', {
	linkId: uuid('link_id')
		.notNull()
		.references(() => link.id),
	labelId: uuid('label_id')
		.notNull()
		.references(() => label.id)
}, (table) => {
	return {
		pk: { name: 'link_label_pk', columns: [table.linkId, table.labelId] }
	};
});

// Export types
export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
export type Link = typeof link.$inferSelect;
export type Note = typeof note.$inferSelect;
export type Label = typeof label.$inferSelect;
export type LinkLabel = typeof linkLabel.$inferSelect;
