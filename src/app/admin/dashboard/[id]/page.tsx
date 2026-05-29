import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { applications } from "@/lib/schema";
import { isAuthenticated } from "@/lib/auth";
import { QUESTIONS } from "@/lib/questions";

export const dynamic = "force-dynamic";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeStyle: "short",
});

type PageProps = { params: Promise<{ id: string }> };

export default async function ApplicationDetailPage({ params }: PageProps) {
  if (!(await isAuthenticated())) {
    redirect("/admin");
  }

  const { id } = await params;
  if (!UUID_REGEX.test(id)) notFound();

  const [application] = await db
    .select()
    .from(applications)
    .where(eq(applications.id, id))
    .limit(1);

  if (!application) notFound();

  const answersById = new Map(application.answers.map((a) => [a.questionId, a]));

  return (
    <div className="admin-shell">
      <div className="admin-container">
        <div className="admin-topbar">
          <div>
            <Link href="/admin/dashboard" className="admin-link" style={{ display: "inline-block", marginBottom: 16 }}>
              ← Voltar
            </Link>
            <h1>{application.fullName}</h1>
            <p className="sub">Enviado em {dateFormatter.format(application.createdAt)}</p>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-meta">
            {application.age && (
              <span>
                <strong>Idade:</strong> {application.age}
              </span>
            )}
            {application.city && (
              <span>
                <strong>Cidade:</strong> {application.city}
              </span>
            )}
            {application.whatsapp && (
              <span>
                <strong>WhatsApp:</strong> {application.whatsapp}
              </span>
            )}
            {application.salaryExpectation && (
              <span>
                <strong>Pretensão:</strong> {application.salaryExpectation}
              </span>
            )}
          </div>
        </div>

        <div className="detail-card">
          {QUESTIONS.map((question) => {
            const record = answersById.get(question.id);
            const answer = record?.answer ?? null;
            return (
              <div className="answer-block" key={question.id}>
                <div className="answer-q">
                  {String(question.id).padStart(2, "0")} — {question.title}
                </div>
                <div className={`answer-a ${answer ? "" : "empty"}`}>{answer ?? "— não respondido —"}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
