import { BadgeCheck, Clock3, FileCheck2, ShieldAlert } from "lucide-react";

const POLICY_ITEMS = [
  "Access requires authenticated sessions and scoped authorization.",
  "IPNetDB data is used for routing intelligence, not geolocation claims.",
  "User sessions expire cleanly and are cleared on unauthorized responses.",
];

const SLA_ITEMS = [
  { label: "Lookup target", value: "Sub-second UI response after API return" },
  { label: "Availability target", value: "Best-effort local demo with graceful fallbacks" },
  { label: "Session integrity", value: "Server-side token validation on protected routes" },
];

const COMPLIANCE_ITEMS = [
  "Auth flows keep protected lookup endpoints behind bearer validation.",
  "Route data is displayed with allocation-country disclaimers.",
  "Risk signals include anomaly, bogon, and RPKI states for review.",
];

function SectionCard({ icon: Icon, title, children, tone = "slate" }) {
  const tones = {
    slate: "border-slate-200 bg-white",
    teal: "border-teal-200 bg-teal-50",
    amber: "border-amber-200 bg-amber-50",
  };

  return (
    <section className={`animate-fade-up rounded-2xl border p-5 shadow-sm ${tones[tone]}`}>
      <div className="inline-flex rounded-lg bg-white/80 p-2 text-teal-700 shadow-sm ring-1 ring-black/5">
        <Icon size={18} />
      </div>
      <h2 className="mt-3 text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-slate-700">{children}</div>
    </section>
  );
}

export default function Governance() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-7xl flex-col gap-5 px-4 py-8 md:px-6 lg:px-8">
      <section className="animate-fade-up rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 p-8 text-white shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-200">
          Governance Center
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight md:text-5xl">
          Policy, SLA, and compliance controls in one place.
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-slate-200 md:text-base">
          This page makes the workspace feel intentional: it explains access policy, sets response expectations, and documents compliance rules that shape how Grafinet should be used.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <SectionCard icon={ShieldAlert} title="Policy" tone="slate">
          <ul className="space-y-2">
            {POLICY_ITEMS.map((item) => (
              <li key={item} className="flex gap-2">
                <BadgeCheck size={16} className="mt-0.5 shrink-0 text-teal-700" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard icon={Clock3} title="SLA" tone="teal">
          <ul className="space-y-3">
            {SLA_ITEMS.map((item) => (
              <li key={item.label} className="rounded-xl border border-teal-100 bg-white/80 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{item.label}</p>
                <p className="mt-1 text-sm text-slate-700">{item.value}</p>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard icon={FileCheck2} title="Compliance" tone="amber">
          <ul className="space-y-2">
            {COMPLIANCE_ITEMS.map((item) => (
              <li key={item} className="flex gap-2">
                <BadgeCheck size={16} className="mt-0.5 shrink-0 text-amber-700" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </section>

      <section className="animate-fade-up stagger-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">How this improves the UI</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          By separating policy, SLA, and compliance from the live lookup flow, the app feels organized and easier to scan. Users can understand the rules before entering the workspace, which reduces confusion and makes the interface feel like a real product dashboard.
        </p>
      </section>
    </main>
  );
}