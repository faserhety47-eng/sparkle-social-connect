import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Вход — OzTop Media" },
      { name: "description", content: "Вход в личный кабинет OzTop Media." },
      { property: "og:title", content: "Вход — OzTop Media" },
      { property: "og:description", content: "Вход в личный кабинет." },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email("Некорректный email").max(255),
  password: z.string().min(6, "Минимум 6 символов").max(72),
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse({ email, password });
    if (!r.success) return toast.error(r.error.issues[0].message);
    toast.success("Демо-вход выполнен", { description: `Добро пожаловать, ${email}` });
  };

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-3xl bg-card p-8 shadow-tile">
        <h1 className="text-2xl font-extrabold">Вход в аккаунт</h1>
        <p className="mt-1 text-sm text-muted-foreground">Продолжите работу с OzTop Media.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-sm font-semibold">Пароль</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <button type="submit" className="btn-primary w-full">Войти</button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Нет аккаунта? <Link to="/register" className="text-primary font-semibold hover:underline">Регистрация</Link>
        </p>
      </div>
    </section>
  );
}
