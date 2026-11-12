CREATE TYPE "public"."country" AS ENUM('Japan', 'China', 'Korea');--> statement-breakpoint
CREATE TYPE "public"."nomination_category" AS ENUM('player', 'game');--> statement-breakpoint
CREATE TYPE "public"."nomination_status" AS ENUM('pending', 'accepted', 'declined');--> statement-breakpoint
CREATE TABLE "criteria" (
	"id" serial PRIMARY KEY NOT NULL,
	"position" integer NOT NULL,
	"title" text NOT NULL,
	"text" text NOT NULL,
	CONSTRAINT "criteria_position_unique" UNIQUE("position")
);
--> statement-breakpoint
CREATE TABLE "game_players" (
	"game_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	CONSTRAINT "game_players_game_id_player_id_pk" PRIMARY KEY("game_id","player_id")
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"year" integer NOT NULL,
	"name" text NOT NULL,
	"black" text NOT NULL,
	"white" text NOT NULL,
	"result" text NOT NULL,
	"setting" text NOT NULL,
	"hook" text NOT NULL,
	"moment" text NOT NULL,
	"legacy" text NOT NULL,
	"sgf_url" text,
	"sequence" integer DEFAULT 0 NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "games_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "nominations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" "nomination_category" NOT NULL,
	"email" text NOT NULL,
	"case_for_induction" text NOT NULL,
	"status" "nomination_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"induction_number" integer NOT NULL,
	"name" text NOT NULL,
	"native_name" text NOT NULL,
	"country" "country" NOT NULL,
	"years" text NOT NULL,
	"distinction" text NOT NULL,
	"bio" text NOT NULL,
	"photo_url" text,
	"photo_position" text DEFAULT '50% 50%' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "players_slug_unique" UNIQUE("slug"),
	CONSTRAINT "players_induction_number_unique" UNIQUE("induction_number")
);
--> statement-breakpoint
CREATE TABLE "timeline_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	"title" text NOT NULL,
	"text" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "game_players" ADD CONSTRAINT "game_players_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_players" ADD CONSTRAINT "game_players_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;