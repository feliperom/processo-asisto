import Link from "next/link";
import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { applications } from "@/lib/schema";
import { isAuthenticated } from "@/lib/auth";
import { LogoutButton } from "../LogoutButton";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export default async function DashboardPage() {
  if (!(await isAuthenticated())) {
    redirect("/admin");
  }

  const rows = await db
    .select({
      id: applications.id,
      fullName: applications.fullName,
      city: applications.city,
      whatsapp: applications.whatsapp,
      salaryExpectation: applications.salaryExpectation,
      createdAt: applications.createdAt,
    })
    .from(applications)
    .orderBy(desc(applications.createdAt));

  return (
    <div className="admin-shell">
      <div className="admin-container">
        <div className="admin-topbar">
          <div>
            <h1>Candidaturas</h1>
            <p className="sub">{rows.length} {rows.length === 1 ? "resposta" : "respostas"} recebidas</p>
          </div>
          <div className="admin-actions">
            <LogoutButton />
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="admin-empty">Nenhuma candidatura recebida ainda.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Cidade</th>
                <th>WhatsApp</th>
                <th>Pretensão</th>
                <th>Enviado em</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Link href={`/admin/dashboard/${row.id}`}>{row.fullName}</Link>
                  </td>
                  <td className={row.city ? "" : "muted"}>{row.city ?? "—"}</td>
                  <td className={row.whatsapp ? "" : "muted"}>{row.whatsapp ?? "—"}</td>
                  <td className={row.salaryExpectation ? "" : "muted"}>{row.salaryExpectation ?? "—"}</td>
                  <td>{dateFormatter.format(row.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
