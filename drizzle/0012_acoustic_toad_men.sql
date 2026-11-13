CREATE TABLE "feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"description" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
