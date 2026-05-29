"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await fetch("/api/admin/logout", { method: "POST" });
      router.replace("/admin");
      router.refresh();
    });
  }

  return (
    <button type="button" className="admin-link" onClick={handleClick} disabled={pending}>
      {pending ? "Saindo..." : "Sair"}
    </button>
  );
}
