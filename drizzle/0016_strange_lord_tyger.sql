CREATE TYPE "public"."contributor_kind" AS ENUM('person', 'organization');--> statement-breakpoint
CREATE TABLE "contributors" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"kind" "contributor_kind" NOT NULL,
	"role" text NOT NULL,
	"period" text DEFAULT '' NOT NULL,
	"bio" text NOT NULL,
	"photo_url" text,
	"photo_position" text DEFAULT '50% 50%' NOT NULL,
	"is_draft" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "contributors_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "timeline_event_contributors" (
	"event_id" integer NOT NULL,
	"contributor_id" integer NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "timeline_event_contributors_event_id_contributor_id_pk" PRIMARY KEY("event_id","contributor_id")
);
--> statement-breakpoint
ALTER TABLE "timeline_event_contributors" ADD CONSTRAINT "timeline_event_contributors_event_id_timeline_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."timeline_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_event_contributors" ADD CONSTRAINT "timeline_event_contributors_contributor_id_contributors_id_fk" FOREIGN KEY ("contributor_id") REFERENCES "public"."contributors"("id") ON DELETE cascade ON UPDATE no action;