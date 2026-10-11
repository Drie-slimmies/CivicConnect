import type { Metadata } from "next";
import { RequestForm } from "@/components/requests/RequestForm";
import { PageTitle } from "@/components/ui/PageTitle";

export const metadata: Metadata = { title: "Report an issue" };

export default function NewRequestPage() {
  return (
    <div className="max-w-2xl">
      <PageTitle title="Report an issue">Tell us what needs fixing. All fields are required.</PageTitle>
      <div className="rounded-card border border-line bg-surface p-6 shadow-soft sm:p-8">
        <RequestForm />
      </div>
    </div>
  );
}
