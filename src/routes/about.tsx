import { createFileRoute } from "@tanstack/react-router";
import { Advantages } from "@/components/site/Advantages";
import { Team } from "@/components/site/Team";
import { Stats } from "@/components/site/Stats";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "О компании — smm-cat.site" },
      { name: "description", content: "smm-cat.site — платформа для накрутки в 40+ соцсетях. 8 лет на рынке, 11.8 млн выполненных заказов, 115 тыс. клиентов." },
      { property: "og:title", content: "О компании — smm-cat.site" },
      { property: "og:description", content: "Кто мы, чем занимаемся и почему нам доверяют." },
      { property: "og:url", content: "https://smm-cat.site/about" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://smm-cat.site/about" }],
  }),
  component: About,
});

function About() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
      <div className="max-w-3xl">
        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">О компании smm-cat.site</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Мы — SMM-платформа, которая уже 8 лет помогает блогерам, брендам и агентствам расти в социальных сетях.
          Работаем с прямыми поставщиками, тщательно отбираем и модерируем каждую услугу, чтобы вы получали быструю
          и безопасную накрутку по честной цене.
        </p>
      </div>

      <Stats />
      <Advantages />
      <Team />
    </section>
  );
}
