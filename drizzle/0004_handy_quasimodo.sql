ALTER TABLE "games" ADD COLUMN "highlight_move" integer;--> statement-breakpoint
ALTER TABLE "timeline_events" ADD COLUMN "game_id" integer;--> statement-breakpoint
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE set null ON UPDATE no action;