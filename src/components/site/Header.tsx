import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-background/85 backdrop-blur-md border-b border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="relative h-9 w-9 rounded-full bg-gradient-to-br from-brand to-brand-2 flex items-center justify-center shadow-md">
            <Zap className="h-4 w-4 text-white fill-white" />
          </div>
          <div className="leading-none">
            <div className="text-lg font-extrabold tracking-tight brand-logo">OzTop</div>
            <div className="text-[10px] font-semibold text-muted-foreground -mt-0.5">MEDIA</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/order" className="hover:text-primary transition-colors">Оформить заказ</Link>
          <Link to="/services" className="hover:text-primary transition-colors">Услуги</Link>
          <Link to="/api" className="hover:text-primary transition-colors">API</Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/login" className="btn-ghost text-sm">Войти</Link>
          <Link to="/register" className="btn-primary text-sm">Регистрация</Link>
        </div>
      </div>
    </header>
  );
}
