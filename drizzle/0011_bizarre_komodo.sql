ALTER TABLE "timeline_events" ADD COLUMN "position" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE "timeline_events" AS e SET "position" = ranked.rank FROM (SELECT "id", (row_number() OVER (ORDER BY "year", "id")) - 1 AS rank FROM "timeline_events") AS ranked WHERE e."id" = ranked."id";--> statement-breakpoint
ALTER TABLE "timeline_events" ALTER COLUMN "year" SET DATA TYPE text;
