import Link from "next/link";
import { STATUSES, STATUS_HELP } from "@/lib/dto";
import { TrackForm } from "@/components/requests/TrackForm";
import { buttonClass } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function Home() {
  return (
    <div className="flex flex-col gap-14">
      <section className="max-w-2xl">
        <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Something needs fixing? Tell us once, then follow it until it is done.
        </h1>
        <p className="mt-4 text-lg text-muted">
          Report a problem in your area and get a tracking ID. Check on it at any time, without calling around.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section aria-labelledby="report" className="flex flex-col items-start gap-4 rounded-card bg-primary-soft p-6 shadow-soft">
          <h2 id="report" className="font-display text-2xl font-semibold">
            Report an issue
          </h2>
          <p className="max-w-prose text-muted">Takes about two minutes. You will need a title, a category, the location and a short description.</p>
          <Link href="/requests/new" className={buttonClass()}>
            Report an issue
          </Link>
        </section>

        <section aria-labelledby="track" className="rounded-card border border-line bg-surface p-6 shadow-soft">
          <h2 id="track" className="mb-4 font-display text-2xl font-semibold">
            Track a request
          </h2>
          <TrackForm />
        </section>
      </div>

      <section aria-labelledby="statuses">
        <h2 id="statuses" className="mb-5 font-display text-2xl font-semibold">
          What each status means
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          {STATUSES.map((s) => (
            <div key={s} className="flex flex-col items-start gap-2 rounded-card border border-line bg-surface p-5">
              <dt>
                <StatusBadge status={s} />
              </dt>
              <dd className="text-muted">{STATUS_HELP[s]}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
