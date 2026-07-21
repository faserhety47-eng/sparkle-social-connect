import { Link } from "@tanstack/react-router";
import { Moon } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-baseline gap-1.5 shrink-0">
          <span className="text-xl md:text-2xl font-extrabold tracking-tight brand-logo">SMM</span>
          <span className="text-lg md:text-xl font-semibold text-foreground/90">Rails</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-foreground/85">
          <Link to="/" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>Главная</Link>
          <Link to="/order" className="hover:text-foreground transition-colors">AI чат</Link>
          <Link to="/api" className="hover:text-foreground transition-colors">API</Link>
          <Link to="/services" className="hover:text-foreground transition-colors">Услуги</Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            aria-label="Сменить тему"
            className="h-10 w-10 rounded-xl border border-border bg-card/70 hover:bg-card grid place-items-center transition-colors"
          >
            <Moon className="h-4 w-4" />
          </button>
          <Link to="/login" className="btn-ghost text-sm">Войти</Link>
          <Link to="/register" className="btn-primary text-sm">Регистрация</Link>
        </div>
      </div>
    </header>
  );
}
