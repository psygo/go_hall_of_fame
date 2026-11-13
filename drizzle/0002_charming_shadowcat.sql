CREATE TABLE "resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer,
	"player_id" integer,
	"url" text NOT NULL,
	"description" text,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "resources_one_owner" CHECK (("resources"."game_id" is null) <> ("resources"."player_id" is null))
);
--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "black_player_id" integer;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "white_player_id" integer;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "sgf_text" text;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_black_player_id_players_id_fk" FOREIGN KEY ("black_player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_white_player_id_players_id_fk" FOREIGN KEY ("white_player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;