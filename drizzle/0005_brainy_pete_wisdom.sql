ALTER TABLE "resources" DROP CONSTRAINT "resources_one_owner";--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "description" text DEFAULT '' NOT NULL;--> statement-breakpoint
-- The three old text fields become one description, in the order they were read.
UPDATE "games" SET "description" = "hook" || E'\n\n' || "moment" || E'\n\n' || "legacy";--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_at_most_one_owner" CHECK (("resources"."game_id" is null) or ("resources"."player_id" is null));