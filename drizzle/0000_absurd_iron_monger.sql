CREATE TYPE "public"."request_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(64) NOT NULL,
	"title" varchar(128) NOT NULL,
	"description" text,
	"criteria" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "achievements_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "daily_rankings" (
	"id" serial PRIMARY KEY NOT NULL,
	"platform_id" integer NOT NULL,
	"streamer_id" integer NOT NULL,
	"rank_date" date NOT NULL,
	"rank" integer NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"followers" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platforms" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(64) NOT NULL,
	"name" varchar(128) NOT NULL,
	"website_url" varchar(256),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "platforms_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "rank_deltas" (
	"id" serial PRIMARY KEY NOT NULL,
	"platform_id" integer NOT NULL,
	"streamer_id" integer NOT NULL,
	"rank_date" date NOT NULL,
	"previous_rank" integer,
	"current_rank" integer,
	"delta" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "removal_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"streamer_id" integer,
	"platform_id" integer,
	"alias" varchar(128),
	"requester_email" varchar(256),
	"reason" text,
	"status" "request_status" DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "streamer_achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"streamer_id" integer NOT NULL,
	"achievement_id" integer NOT NULL,
	"awarded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"details" text
);
--> statement-breakpoint
CREATE TABLE "streamer_aliases" (
	"id" serial PRIMARY KEY NOT NULL,
	"streamer_id" integer NOT NULL,
	"platform_id" integer NOT NULL,
	"alias" varchar(128) NOT NULL,
	"profile_url" varchar(512),
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "streamers" (
	"id" serial PRIMARY KEY NOT NULL,
	"display_name" varchar(128) NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"streamer_id" integer NOT NULL,
	"platform_id" integer,
	"alias" varchar(128),
	"contact_email" varchar(256) NOT NULL,
	"proof_url" varchar(512),
	"status" "request_status" DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "daily_rankings" ADD CONSTRAINT "daily_rankings_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_rankings" ADD CONSTRAINT "daily_rankings_streamer_id_streamers_id_fk" FOREIGN KEY ("streamer_id") REFERENCES "public"."streamers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rank_deltas" ADD CONSTRAINT "rank_deltas_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rank_deltas" ADD CONSTRAINT "rank_deltas_streamer_id_streamers_id_fk" FOREIGN KEY ("streamer_id") REFERENCES "public"."streamers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "removal_requests" ADD CONSTRAINT "removal_requests_streamer_id_streamers_id_fk" FOREIGN KEY ("streamer_id") REFERENCES "public"."streamers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "removal_requests" ADD CONSTRAINT "removal_requests_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streamer_achievements" ADD CONSTRAINT "streamer_achievements_streamer_id_streamers_id_fk" FOREIGN KEY ("streamer_id") REFERENCES "public"."streamers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streamer_achievements" ADD CONSTRAINT "streamer_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streamer_aliases" ADD CONSTRAINT "streamer_aliases_streamer_id_streamers_id_fk" FOREIGN KEY ("streamer_id") REFERENCES "public"."streamers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streamer_aliases" ADD CONSTRAINT "streamer_aliases_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_streamer_id_streamers_id_fk" FOREIGN KEY ("streamer_id") REFERENCES "public"."streamers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "achievements_code_uq" ON "achievements" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_rankings_unique" ON "daily_rankings" USING btree ("platform_id","streamer_id","rank_date");--> statement-breakpoint
CREATE INDEX "daily_rankings_date_idx" ON "daily_rankings" USING btree ("rank_date");--> statement-breakpoint
CREATE UNIQUE INDEX "platforms_slug_uq" ON "platforms" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "rank_deltas_unique" ON "rank_deltas" USING btree ("platform_id","streamer_id","rank_date");--> statement-breakpoint
CREATE INDEX "removal_requests_status_idx" ON "removal_requests" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "streamer_achievements_unique" ON "streamer_achievements" USING btree ("streamer_id","achievement_id");--> statement-breakpoint
CREATE UNIQUE INDEX "streamer_aliases_platform_alias_uq" ON "streamer_aliases" USING btree ("platform_id","alias");--> statement-breakpoint
CREATE INDEX "streamer_aliases_streamer_platform_idx" ON "streamer_aliases" USING btree ("streamer_id","platform_id");--> statement-breakpoint
CREATE INDEX "streamers_display_name_idx" ON "streamers" USING btree ("display_name");--> statement-breakpoint
CREATE INDEX "verification_requests_status_idx" ON "verification_requests" USING btree ("status");