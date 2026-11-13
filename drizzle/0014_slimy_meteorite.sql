CREATE TABLE "timeline_event_games" (
	"event_id" integer NOT NULL,
	"game_id" integer NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "timeline_event_games_event_id_game_id_pk" PRIMARY KEY("event_id","game_id")
);
--> statement-breakpoint
CREATE TABLE "timeline_event_players" (
	"event_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "timeline_event_players_event_id_player_id_pk" PRIMARY KEY("event_id","player_id")
);
--> statement-breakpoint
ALTER TABLE "timeline_events" DROP CONSTRAINT "timeline_events_game_id_games_id_fk";
--> statement-breakpoint
ALTER TABLE "timeline_event_games" ADD CONSTRAINT "timeline_event_games_event_id_timeline_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."timeline_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_event_games" ADD CONSTRAINT "timeline_event_games_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_event_players" ADD CONSTRAINT "timeline_event_players_event_id_timeline_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."timeline_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_event_players" ADD CONSTRAINT "timeline_event_players_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
INSERT INTO "timeline_event_games" ("event_id", "game_id", "position") SELECT "id", "game_id", 0 FROM "timeline_events" WHERE "game_id" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "timeline_events" DROP COLUMN "game_id";