export function SuccessPopup({ title, text }: { title: string; text: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div
        role="status"
        className="w-full max-w-sm rounded-card border border-line bg-surface p-8 text-center shadow-soft"
      >
        <span
          aria-hidden="true"
          className="mx-auto flex size-12 items-center justify-center rounded-full bg-success-soft text-2xl text-success"
        >
          ✓
        </span>
        <p className="mt-4 text-lg font-semibold">{title}</p>
        <p className="mt-1 text-sm text-muted">{text}</p>
      </div>
    </div>
  );
}
