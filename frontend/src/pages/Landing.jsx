import { Link } from "react-router-dom";
import { ArrowRight, Compass, Route, ShieldAlert, ShieldCheck, TimerReset, FileCheck2 } from "lucide-react";

const HIGHLIGHTS = [
  {
    title: "Trace network ownership",
    text: "Inspect ASN ownership, advertised prefixes, and allocation origins without leaving the browser.",
  },
  {
    title: "Visualize route context",
    text: "Map IP lookups instantly and correlate prefix-level data with route integrity signals.",
  },
  {
    title: "Investigate anomalies faster",
    text: "Use recommendation cards and anomaly reasons to prioritize what to verify next.",
  },
];

const GOVERNANCE = [
  { label: "Policy", value: "Authenticated lookup access" , icon: ShieldCheck },
  { label: "SLA", value: "Guided, responsive analysis flow", icon: TimerReset },
  { label: "Compliance", value: "Routing context with disclaimers", icon: FileCheck2 },
];

export default function Landing() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-6 lg:px-8">
      <section className="animate-fade-up overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 p-8 text-white shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-200">
          Network Intelligence Suite
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight md:text-5xl">
          A structured routing workspace with policy, SLA, and compliance context.
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-slate-200 md:text-base">
          Grafinet brings search, visualization, onboarding, and recommendations together so teams can inspect internet routing data with less confusion and better confidence.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/workspace"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Open workspace
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/guide"
            className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <Compass size={16} />
            Read quick guide
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {GOVERNANCE.map((item, index) => {
          const Icon = item.icon;

          return (
            <article
              key={item.label}
              className={`animate-fade-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${index === 0 ? "stagger-1" : index === 1 ? "stagger-2" : "stagger-3"}`}
            >
              <div className="inline-flex rounded-lg bg-teal-50 p-2 text-teal-700">
                <Icon size={18} />
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
              <p className="mt-2 text-sm font-medium text-slate-900">{item.value}</p>
            </article>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {HIGHLIGHTS.map((item, index) => {
          const cardIcon = [Route, Compass, ShieldAlert][index] || Route;
          const Icon = cardIcon;

          return (
          <article
            key={item.title}
            className={`animate-fade-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${index === 0 ? "stagger-1" : index === 1 ? "stagger-2" : "stagger-3"}`}
          >
            <div className="mb-3 inline-flex rounded-lg bg-teal-50 p-2 text-teal-700">
              <Icon size={18} />
            </div>
            <h2 className="text-base font-semibold text-slate-900">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
          </article>
          );
        })}
      </section>

      <section className="animate-fade-up stagger-2 rounded-2xl border border-teal-200 bg-teal-50 p-5">
        <h2 className="text-lg font-semibold text-teal-900">Why this structure helps users</h2>
        <p className="mt-2 text-sm leading-relaxed text-teal-800">
          New users start with the overview and guide pages first, then move into the workspace when they understand what each field means. This lowers friction and reduces accidental misuse of route metadata.
        </p>
      </section>
    </main>
  );
}