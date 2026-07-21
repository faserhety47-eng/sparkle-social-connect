import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Регистрация — OzTop Media" },
      { name: "description", content: "Создайте аккаунт OzTop Media, чтобы получить доступ к API и истории заказов." },
      { property: "og:title", content: "Регистрация — OzTop Media" },
      { property: "og:description", content: "Создание аккаунта в OzTop Media." },
    ],
  }),
  component: RegisterPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Минимум 2 символа").max(100),
  email: z.string().trim().email("Некорректный email").max(255),
  password: z.string().min(6, "Минимум 6 символов").max(72),
});

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse({ name, email, password });
    if (!r.success) return toast.error(r.error.issues[0].message);
    toast.success("Аккаунт создан (демо)", { description: `Добро пожаловать, ${name}` });
  };

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-3xl bg-card p-8 shadow-tile">
        <h1 className="text-2xl font-extrabold">Регистрация</h1>
        <p className="mt-1 text-sm text-muted-foreground">Займёт меньше минуты.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold">Имя</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100}
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
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
          <button type="submit" className="btn-primary w-full">Создать аккаунт</button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Уже есть аккаунт? <Link to="/login" className="text-primary font-semibold hover:underline">Войти</Link>
        </p>
      </div>
    </section>
  );
}
