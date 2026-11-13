ALTER TABLE "resources" ADD COLUMN "title" text DEFAULT '' NOT NULL;
--> statement-breakpoint
UPDATE "resources" SET "title" = "url" WHERE "title" = '';
