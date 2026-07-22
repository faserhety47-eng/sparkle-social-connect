import { Link } from "@tanstack/react-router";

export function Footer() {
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
            <li><Link to="/" className="hover:text-primary">Главная</Link></li>
            <li><Link to="/order" className="hover:text-primary">Оформить заказ</Link></li>
            <li><Link to="/services" className="hover:text-primary">Услуги</Link></li>
            
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Аккаунт</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/login" className="hover:text-primary">Вход</Link></li>
            <li><Link to="/register" className="hover:text-primary">Регистрация</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} smm-cat.site. Все права защищены.
      </div>
    </footer>
  );
}
