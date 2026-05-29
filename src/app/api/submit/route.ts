import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applications } from "@/lib/schema";
import { QUESTIONS, buildAnswerRecords, type AnswerValue } from "@/lib/questions";

type SubmitBody = {
  answers: Record<string, AnswerValue>;
};

function validateRawAnswers(raw: Record<string, AnswerValue>): {
  normalized: Record<number, AnswerValue>;
  errors: string[];
} {
  const normalized: Record<number, AnswerValue> = {};
  const errors: string[] = [];

  QUESTIONS.forEach((question, idx) => {
    const value = raw[String(idx)] ?? raw[idx as unknown as string] ?? null;
    normalized[idx] = value;

    if (!question.required) return;

    if (question.type === "multi") {
      if (!Array.isArray(value) || value.length === 0) {
        errors.push(`Pergunta ${question.id} é obrigatória.`);
      }
      return;
    }
    if (question.type === "single") {
      if (typeof value !== "number") {
        errors.push(`Pergunta ${question.id} é obrigatória.`);
      }
      return;
    }
    if (typeof value !== "string" || value.trim().length === 0) {
      errors.push(`Pergunta ${question.id} é obrigatória.`);
    }
  });

  return { normalized, errors };
}

function pickAnswerText(records: ReturnType<typeof buildAnswerRecords>, questionId: number): string | null {
  return records.find((r) => r.questionId === questionId)?.answer ?? null;
}

export async function POST(request: Request) {
  let body: SubmitBody;
  try {
    body = (await request.json()) as SubmitBody;
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || !body.answers) {
    return NextResponse.json({ error: "Respostas ausentes." }, { status: 400 });
  }

  const { normalized, errors } = validateRawAnswers(body.answers);
  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
  }

  const records = buildAnswerRecords(normalized);
  const fullName = pickAnswerText(records, 1);

  if (!fullName) {
    return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
  }

  const inserted = await db
    .insert(applications)
    .values({
      fullName,
      age: pickAnswerText(records, 2),
      city: pickAnswerText(records, 3),
      whatsapp: pickAnswerText(records, 4),
      salaryExpectation: pickAnswerText(records, 16),
      answers: records,
    })
    .returning({ id: applications.id });

  return NextResponse.json({ id: inserted[0]?.id ?? null });
}
