import { Link, useNavigate } from "@tanstack/react-router";
import { Moon, User, Shield } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { supabase } from "@/integrations/supabase/client";

export function Header() {
  const { user, loading } = useSession();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-baseline gap-1.5 shrink-0">
          <span className="text-xl md:text-2xl font-extrabold tracking-tight brand-logo">Oz</span>
          <span className="text-lg md:text-xl font-semibold text-foreground/90">Top</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-foreground/85">
          <Link to="/" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>Главная</Link>
          <Link to="/order" className="hover:text-foreground transition-colors">Заказать</Link>
          <Link to="/services" className="hover:text-foreground transition-colors">Услуги</Link>
          <Link to="/api" className="hover:text-foreground transition-colors">API</Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            aria-label="Сменить тему"
            className="h-10 w-10 rounded-xl border border-border bg-card/70 hover:bg-card grid place-items-center transition-colors"
          >
            <Moon className="h-4 w-4" />
          </button>
          {loading ? null : user ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="btn-ghost text-sm inline-flex items-center gap-1.5">
                  <Shield className="h-4 w-4" /> Админ
                </Link>
              )}
              <Link to="/account" className="btn-ghost text-sm inline-flex items-center gap-1.5">
                <User className="h-4 w-4" /> Кабинет
              </Link>
              <button onClick={logout} className="btn-ghost text-sm">Выйти</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm">Войти</Link>
              <Link to="/register" className="btn-primary text-sm">Регистрация</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
