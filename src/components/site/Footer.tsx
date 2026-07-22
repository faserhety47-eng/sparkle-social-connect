import { Link } from "@tanstack/react-router";
import { useNavLinks } from "@/hooks/useNavLinks";
import { Send } from "lucide-react";

export function Footer() {
  const links = useNavLinks("footer");
  return (
    <footer className="mt-24 border-t border-border/60 bg-card/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid gap-8 md:grid-cols-4">
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
              <li key={l.url + l.label}>
                <Link to={l.url} className="hover:text-primary">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Аккаунт</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/login" className="hover:text-primary">Вход</Link></li>
            <li><Link to="/register" className="hover:text-primary">Регистрация</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Правовые документы</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/privacy-policy" className="hover:text-primary">Политика конфиденциальности</Link></li>
            <li><Link to="/terms-of-service" className="hover:text-primary">Пользовательское соглашение</Link></li>
            <li><Link to="/public-offer" className="hover:text-primary">Договор оферты</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Контакты</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="https://t.me/serh465" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-primary">
                <Send className="h-4 w-4" />
                Telegram
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} smm-cat.site. Все права защищены.</p>
        <p className="mt-1">ИНН владельца: 245712479721</p>
      </div>
    </footer>
  );
}
