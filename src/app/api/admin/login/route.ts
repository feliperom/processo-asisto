import { NextResponse } from "next/server";
import { createSession, verifyPassword } from "@/lib/auth";

type LoginBody = { password?: string };

export async function POST(request: Request) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const password = body?.password ?? "";
  if (typeof password !== "string" || password.length === 0) {
    return NextResponse.json({ error: "Informe a senha." }, { status: 400 });
  }

  if (!verifyPassword(password)) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  await createSession();
  return NextResponse.json({ ok: true });
}
