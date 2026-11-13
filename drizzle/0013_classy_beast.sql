ALTER TABLE "games" ADD COLUMN "is_draft" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "is_draft" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "timeline_events" ADD COLUMN "is_draft" boolean DEFAULT false NOT NULL;