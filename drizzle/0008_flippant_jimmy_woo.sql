ALTER TABLE "games" ADD COLUMN "tags" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "tags" text[] DEFAULT '{}'::text[] NOT NULL;