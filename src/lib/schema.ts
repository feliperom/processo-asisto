import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { AnswerRecord } from "./questions";

export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  fullName: text("full_name").notNull(),
  age: text("age"),
  city: text("city"),
  whatsapp: text("whatsapp"),
  salaryExpectation: text("salary_expectation"),
  answers: jsonb("answers").$type<AnswerRecord[]>().notNull(),
});

export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
