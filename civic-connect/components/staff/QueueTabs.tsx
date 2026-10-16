import Link from "next/link";

type Key = "unassigned" | "mine" | "all";

export function QueueTabs({ active, showMine }: { active: Key; showMine: boolean }) {
  const tabs: { href: string; label: string; key: Key }[] = [
    { href: "/queue", label: "Unassigned", key: "unassigned" },
    ...(showMine ? [{ href: "/queue/mine", label: "My requests", key: "mine" as const }] : []),
    { href: "/queue/all", label: "All requests", key: "all" },
  ];
  return (
    <nav aria-label="Request queues" className="mb-6 flex flex-wrap gap-2">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          aria-current={t.key === active ? "page" : undefined}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            t.key === active ? "border-primary bg-primary text-on-primary" : "border-line bg-surface hover:border-primary"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
