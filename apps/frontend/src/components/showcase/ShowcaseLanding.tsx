import Link from "next/link";

const links = [
  {
    href: "/showcase/components",
    title: "shadcn/ui components",
    description:
      "Every shadcn/ui primitive (new-york style on Tailwind v4) — buttons, inputs, overlays, menus, charts, navigation and more.",
    badge: "56 components",
  },
  {
    href: "/showcase/data-table",
    title: "DataTable",
    description:
      "The shared TanStack DataTable in both client-side and server-side (simulated backend) rendering modes.",
    badge: "client + server",
  },
  {
    href: "/showcase/form",
    title: "Zod form",
    description:
      "A custom form built with RHFZodForm and a Zod schema — typed values, blur + submit validation, live payload.",
    badge: "react-hook-form + zod",
  },
  {
    href: "/users",
    title: "useAPI hook",
    description: "The existing CRUD example wired to the NestJS backend.",
    badge: "API demo",
  },
];

export function ShowcaseLanding() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-16">
      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Component & UI showcase
        </h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          A living catalogue of the shared UI building blocks in this project.
          All components live under{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">
            @/components/shared
          </code>
          .
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {l.badge}
            </span>
            <h2 className="mt-3 text-lg font-semibold text-slate-900 group-hover:text-indigo-600">
              {l.title} →
            </h2>
            <p className="mt-1 text-sm text-slate-500">{l.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
