ALTER TYPE "public"."contributor_kind" ADD VALUE 'entity';--> statement-breakpoint
ALTER TABLE "contributors" ADD COLUMN "birth_year" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "contributors" ALTER COLUMN "birth_year" DROP DEFAULT;
