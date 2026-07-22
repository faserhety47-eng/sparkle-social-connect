import { createFileRoute } from "@tanstack/react-router";
import { Faq } from "@/components/site/Faq";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "F.A.Q. — smm-cat.site" },
      { name: "description", content: "Ответы на частые вопросы про накрутку, оплату, безопасность и сроки выполнения заказов smm-cat.site." },
      { property: "og:title", content: "F.A.Q. — smm-cat.site" },
      { property: "og:description", content: "Частые вопросы о работе SMM-сервиса smm-cat.site." },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
      <div className="max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-extrabold">Частые вопросы</h1>
        <p className="mt-3 text-muted-foreground">
          Не нашли ответ? Напишите в поддержку — отвечаем в течение 24 часов.
        </p>
      </div>
      <Faq />
    </section>
  );
}
