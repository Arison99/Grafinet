import { CirclePlay, Eye, Lightbulb, ShieldCheck } from "lucide-react";

const GUIDE_STEPS = [
  {
    title: "Understand what data means",
    text: "Grafinet uses IPNetDB to show routing allocation, prefix, ASN ownership, and anomaly indicators from routing data.",
    icon: Eye,
  },
  {
    title: "Run your first lookup",
    text: "Try a known public resolver like 8.8.8.8 or 1.1.1.1 to see map placement, ASN context, and prefix metadata.",
    icon: CirclePlay,
  },
  {
    title: "Interpret risk signals",
    text: "Review RPKI status, bogon flags, and anomaly reasons to decide whether traffic should be trusted or investigated.",
    icon: ShieldCheck,
  },
];

export default function OnboardingModal({
  open,
  canRunDemo,
  onClose,
  onComplete,
  onRunDemo,
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <section className="animate-fade-up max-h-[88vh] w-full max-w-3xl overflow-auto rounded-2xl border border-sky-200 bg-gradient-to-b from-white to-sky-50 p-6 shadow-2xl">
        <div className="inline-flex rounded-lg bg-amber-100 p-2 text-amber-700">
          <Lightbulb size={18} />
        </div>
        <h2 id="onboarding-title" className="mt-3 text-2xl font-bold text-slate-900">
          Welcome to Grafinet
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          This onboarding gives you a fast path to understand what the app does and how to use it without guessing.
        </p>

        <ol className="mt-4 grid list-decimal gap-3 pl-5">
          {GUIDE_STEPS.map((step, index) => {
            const Icon = step.icon;

            return (
            <li key={step.title}>
              <h3
                className={`inline-flex items-center gap-2 text-base font-semibold text-slate-900 ${
                  index === 0 ? "animate-fade-up stagger-1" : index === 1 ? "animate-fade-up stagger-2" : "animate-fade-up stagger-3"
                }`}
              >
                <Icon size={16} className="text-teal-700" />
                {step.title}
              </h3>
              <p className="mt-1 text-sm text-slate-600">{step.text}</p>
            </li>
            );
          })}
        </ol>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            onClick={onComplete}
          >
            Do not show again
          </button>
          <button
            type="button"
            onClick={onRunDemo}
            disabled={!canRunDemo}
            className="inline-flex items-center justify-center rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-65"
          >
            {canRunDemo ? "Run demo lookup" : "Login to run demo"}
          </button>
        </div>
      </section>
    </div>
  );
}