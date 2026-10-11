import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="font-display text-3xl font-bold">We can&apos;t find that page</h1>
      <p className="max-w-prose text-muted">The link may be mistyped or the request may not exist. Check the address, or start from the home page.</p>
      <Link href="/" className={buttonClass()}>
        Go to the home page
      </Link>
    </div>
  );
}
