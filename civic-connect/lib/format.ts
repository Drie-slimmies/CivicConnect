const base = { timeZone: "Africa/Johannesburg" } as const;

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-ZA", { ...base, day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));

export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-ZA", { ...base, day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso),
  );
