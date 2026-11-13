ALTER TABLE "players" ADD COLUMN "birth_year" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE "players" SET "birth_year" = CASE "slug"
  WHEN 'honinbo-dosaku' THEN 1645
  WHEN 'huang-longshi' THEN 1651
  WHEN 'honinbo-shusaku' THEN 1829
  WHEN 'kitani-minoru' THEN 1909
  WHEN 'go-seigen' THEN 1914
  WHEN 'sakata-eio' THEN 1920
  WHEN 'nie-weiping' THEN 1952
  WHEN 'cho-hunhyun' THEN 1953
  WHEN 'cho-chikun' THEN 1956
  WHEN 'rui-naiwei' THEN 1963
  WHEN 'lee-changho' THEN 1975
  WHEN 'lee-sedol' THEN 1983
  WHEN 'iyama-yuta' THEN 1989
  WHEN 'ke-jie' THEN 1997
  WHEN 'shin-jinseo' THEN 2000
  ELSE "birth_year"
END;--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "birth_year" DROP DEFAULT;--> statement-breakpoint
UPDATE "players" SET "induction_number" = "induction_number" + 100000;--> statement-breakpoint
UPDATE "players" AS p SET "induction_number" = ranked.rank FROM (SELECT "id", row_number() OVER (ORDER BY "birth_year", "id") AS rank FROM "players") AS ranked WHERE p."id" = ranked."id";
