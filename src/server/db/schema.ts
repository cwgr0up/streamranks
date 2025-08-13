// src/server/db/schema.ts
import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  boolean,
  timestamp,
  date,
  uniqueIndex,
  index,
  pgEnum,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/* ----------------------------- Enums ----------------------------- */

export const requestStatus = pgEnum('request_status', ['pending', 'approved', 'rejected']);

/* --------------------------- Core Tables -------------------------- */

export const platforms = pgTable(
  'platforms',
  {
    id: serial('id').primaryKey(),
    slug: varchar('slug', { length: 64 }).notNull().unique(),
    name: varchar('name', { length: 128 }).notNull(),
    websiteUrl: varchar('website_url', { length: 256 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    slugIdx: uniqueIndex('platforms_slug_uq').on(t.slug),
  }),
);

export const streamers = pgTable(
  'streamers',
  {
    id: serial('id').primaryKey(),
    displayName: varchar('display_name', { length: 128 }).notNull(),
    isVerified: boolean('is_verified').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    nameIdx: index('streamers_display_name_idx').on(t.displayName),
  }),
);

export const streamerAliases = pgTable(
  'streamer_aliases',
  {
    id: serial('id').primaryKey(),
    streamerId: integer('streamer_id')
      .notNull()
      .references(() => streamers.id, { onDelete: 'cascade' }),
    platformId: integer('platform_id')
      .notNull()
      .references(() => platforms.id, { onDelete: 'cascade' }),
    alias: varchar('alias', { length: 128 }).notNull(),
    profileUrl: varchar('profile_url', { length: 512 }),
    isPrimary: boolean('is_primary').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    byPlatformAlias: uniqueIndex('streamer_aliases_platform_alias_uq').on(t.platformId, t.alias),
    byStreamerPlatform: index('streamer_aliases_streamer_platform_idx').on(
      t.streamerId,
      t.platformId,
    ),
  }),
);

export const dailyRankings = pgTable(
  'daily_rankings',
  {
    id: serial('id').primaryKey(),
    platformId: integer('platform_id')
      .notNull()
      .references(() => platforms.id, { onDelete: 'cascade' }),
    streamerId: integer('streamer_id')
      .notNull()
      .references(() => streamers.id, { onDelete: 'cascade' }),
    rankDate: date('rank_date').notNull(),
    rank: integer('rank').notNull(),
    score: integer('score').notNull().default(0),
    followers: integer('followers'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    uniqPerDay: uniqueIndex('daily_rankings_unique').on(t.platformId, t.streamerId, t.rankDate),
    byDate: index('daily_rankings_date_idx').on(t.rankDate),
  }),
);

export const rankDeltas = pgTable(
  'rank_deltas',
  {
    id: serial('id').primaryKey(),
    platformId: integer('platform_id')
      .notNull()
      .references(() => platforms.id, { onDelete: 'cascade' }),
    streamerId: integer('streamer_id')
      .notNull()
      .references(() => streamers.id, { onDelete: 'cascade' }),
    rankDate: date('rank_date').notNull(),
    previousRank: integer('previous_rank'),
    currentRank: integer('current_rank'),
    delta: integer('delta'), // + climbed, - dropped
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    uniqPerDay: uniqueIndex('rank_deltas_unique').on(t.platformId, t.streamerId, t.rankDate),
  }),
);

export const achievements = pgTable(
  'achievements',
  {
    id: serial('id').primaryKey(),
    code: varchar('code', { length: 64 }).notNull().unique(),
    title: varchar('title', { length: 128 }).notNull(),
    description: text('description'),
    criteria: jsonb('criteria'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    codeUq: uniqueIndex('achievements_code_uq').on(t.code),
  }),
);

export const streamerAchievements = pgTable(
  'streamer_achievements',
  {
    id: serial('id').primaryKey(),
    streamerId: integer('streamer_id')
      .notNull()
      .references(() => streamers.id, { onDelete: 'cascade' }),
    achievementId: integer('achievement_id')
      .notNull()
      .references(() => achievements.id, { onDelete: 'cascade' }),
    awardedAt: timestamp('awarded_at', { withTimezone: true }).defaultNow().notNull(),
    details: text('details'),
  },
  (t) => ({
    uniqAward: uniqueIndex('streamer_achievements_unique').on(t.streamerId, t.achievementId),
  }),
);

export const verificationRequests = pgTable(
  'verification_requests',
  {
    id: serial('id').primaryKey(),
    streamerId: integer('streamer_id')
      .notNull()
      .references(() => streamers.id, { onDelete: 'cascade' }),
    platformId: integer('platform_id').references(() => platforms.id, { onDelete: 'set null' }),
    alias: varchar('alias', { length: 128 }),
    contactEmail: varchar('contact_email', { length: 256 }).notNull(),
    proofUrl: varchar('proof_url', { length: 512 }),
    status: requestStatus('status').notNull().default('pending'),
    requestedAt: timestamp('requested_at', { withTimezone: true }).defaultNow().notNull(),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    notes: text('notes'),
  },
  (t) => ({
    byStatus: index('verification_requests_status_idx').on(t.status),
  }),
);

export const removalRequests = pgTable(
  'removal_requests',
  {
    id: serial('id').primaryKey(),
    streamerId: integer('streamer_id').references(() => streamers.id, { onDelete: 'set null' }),
    platformId: integer('platform_id').references(() => platforms.id, { onDelete: 'set null' }),
    alias: varchar('alias', { length: 128 }),
    requesterEmail: varchar('requester_email', { length: 256 }),
    reason: text('reason'),
    status: requestStatus('status').notNull().default('pending'),
    requestedAt: timestamp('requested_at', { withTimezone: true }).defaultNow().notNull(),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    notes: text('notes'),
  },
  (t) => ({
    byStatus: index('removal_requests_status_idx').on(t.status),
  }),
);

/* --------------------------- Parent Relations --------------------------- */
/* (Aggregates; these are OK but can be ambiguous without child-side specs) */

export const platformsRelations = relations(platforms, ({ many }) => ({
  aliases: many(streamerAliases),
  rankings: many(dailyRankings),
  deltas: many(rankDeltas),
  verificationRequests: many(verificationRequests),
  removalRequests: many(removalRequests),
}));

export const streamersRelations = relations(streamers, ({ many }) => ({
  aliases: many(streamerAliases),
  rankings: many(dailyRankings),
  deltas: many(rankDeltas),
  awards: many(streamerAchievements),
  verificationRequests: many(verificationRequests),
  removalRequests: many(removalRequests),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  awards: many(streamerAchievements),
}));

/* --------------------------- Child Relations ---------------------------- */
/* (Disambiguate by specifying fields + references for each FK) */

export const streamerAliasesRelations = relations(streamerAliases, ({ one }) => ({
  platform: one(platforms, {
    fields: [streamerAliases.platformId],
    references: [platforms.id],
  }),
  streamer: one(streamers, {
    fields: [streamerAliases.streamerId],
    references: [streamers.id],
  }),
}));

export const dailyRankingsRelations = relations(dailyRankings, ({ one }) => ({
  platform: one(platforms, {
    fields: [dailyRankings.platformId],
    references: [platforms.id],
  }),
  streamer: one(streamers, {
    fields: [dailyRankings.streamerId],
    references: [streamers.id],
  }),
}));

export const rankDeltasRelations = relations(rankDeltas, ({ one }) => ({
  platform: one(platforms, {
    fields: [rankDeltas.platformId],
    references: [platforms.id],
  }),
  streamer: one(streamers, {
    fields: [rankDeltas.streamerId],
    references: [streamers.id],
  }),
}));

export const streamerAchievementsRelations = relations(streamerAchievements, ({ one }) => ({
  streamer: one(streamers, {
    fields: [streamerAchievements.streamerId],
    references: [streamers.id],
  }),
  achievement: one(achievements, {
    fields: [streamerAchievements.achievementId],
    references: [achievements.id],
  }),
}));

export const verificationRequestsRelations = relations(verificationRequests, ({ one }) => ({
  streamer: one(streamers, {
    fields: [verificationRequests.streamerId],
    references: [streamers.id],
  }),
  platform: one(platforms, {
    fields: [verificationRequests.platformId],
    references: [platforms.id],
  }),
}));

export const removalRequestsRelations = relations(removalRequests, ({ one }) => ({
  streamer: one(streamers, {
    fields: [removalRequests.streamerId],
    references: [streamers.id],
  }),
  platform: one(platforms, {
    fields: [removalRequests.platformId],
    references: [platforms.id],
  }),
}));
