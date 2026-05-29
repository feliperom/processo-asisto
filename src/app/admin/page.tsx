import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export default async function AdminLoginPage() {
  if (await isAuthenticated()) {
    redirect("/admin/dashboard");
  }
  return (
    <div className="login-shell">
      <div className="login-card">
        <h1>Painel ASISTO</h1>
        <p>Acesso restrito. Informe a senha para continuar.</p>
        <LoginForm />
      </div>
    </div>
  );
}
