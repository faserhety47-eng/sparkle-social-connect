import { useNavLinks } from "@/hooks/useNavLinks";

export function Footer() {
  const links = useNavLinks("footer");
  return (
    <footer className="mt-24 border-t border-border/60 bg-card/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid gap-8 md:grid-cols-3">
        <div>
          <div className="text-xl font-extrabold brand-logo">smm-cat.site</div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            SMM-платформа для быстрой и качественной накрутки подписчиков, лайков и просмотров.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Сервис</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {links.map((l) => (
              <li key={l.url + l.label}><a href={l.url} className="hover:text-primary">{l.label}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Аккаунт</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="/login" className="hover:text-primary">Вход</a></li>
            <li><a href="/register" className="hover:text-primary">Регистрация</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} smm-cat.site. Все права защищены.
      </div>
    </footer>
  );
}
