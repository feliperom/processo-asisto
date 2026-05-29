CREATE TABLE IF NOT EXISTS "applications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "full_name" text NOT NULL,
  "age" text,
  "city" text,
  "whatsapp" text,
  "salary_expectation" text,
  "answers" jsonb NOT NULL
);

CREATE INDEX IF NOT EXISTS "applications_created_at_idx" ON "applications" ("created_at" DESC);
