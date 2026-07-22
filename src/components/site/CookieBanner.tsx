import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const STORAGE_KEY = "smmcat_cookie_consent_v1";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      /* ignore */
    }
  }, []);

  const decide = (value: "accepted" | "declined") => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:px-6 sm:pb-6">
      <div className="mx-auto max-w-6xl rounded-2xl border border-border bg-card/95 shadow-tile backdrop-blur p-4 sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3 md:items-center">
            <span className="text-2xl leading-none" aria-hidden>🍪</span>
            <div>
              <div className="font-semibold text-foreground">Мы используем cookies</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Файлы cookie помогают улучшать работу сайта и анализировать трафик. Продолжая
                использовать сайт, вы соглашаетесь с{" "}
                <Link to="/privacy" className="text-primary underline underline-offset-2">
                  политикой конфиденциальности
                </Link>
                .
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:shrink-0">
            <button
              onClick={() => decide("accepted")}
              className="btn-primary text-sm px-5"
            >
              Принять все
            </button>
            <button
              onClick={() => decide("declined")}
              className="rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
            >
              Отклонить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
