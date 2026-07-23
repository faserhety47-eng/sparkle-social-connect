import { Link, useNavigate } from "@tanstack/react-router";
import { User, Shield, Wallet, Plus } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useBalance } from "@/hooks/useBalance";
import { supabase } from "@/integrations/supabase/client";
import { useNavLinks } from "@/hooks/useNavLinks";



export function Header() {
  const { user, loading } = useSession();
  const { isAdmin } = useIsAdmin();
  const { balance } = useBalance();
  const navigate = useNavigate();
  const links = useNavLinks("header");



  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-baseline gap-1.5 shrink-0">
          <span className="text-xl md:text-2xl font-extrabold tracking-tight brand-logo">smm-cat</span>
          <span className="text-lg md:text-xl font-semibold text-foreground/90">.site</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-foreground/85">
          {links.map((l) => (
            <a key={l.url + l.label} href={l.url} className="hover:text-foreground transition-colors">{l.label}</a>
          ))}
        </nav>


        <div className="flex items-center gap-2 sm:gap-3">
          {loading ? null : user ? (
            <>
              <Link
                to="/account"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1.5 text-sm font-semibold hover:bg-primary/15"
                title="Ваш баланс"
              >
                <Wallet className="h-4 w-4" />
                {balance.toFixed(2)} ₽
              </Link>
              <Link
                to="/support"
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white px-3 py-1.5 text-sm font-semibold shadow-md hover:opacity-95"
                title="Пополнить баланс"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Пополнить</span>
              </Link>
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
