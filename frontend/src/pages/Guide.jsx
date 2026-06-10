import { Link } from "react-router-dom";
import { ArrowRight, BookOpenCheck, ListChecks, ShieldCheck } from "lucide-react";

const STEPS = [
  "Open the workspace and sign in with your account.",
  "Run a baseline lookup for 8.8.8.8 or 1.1.1.1.",
  "Review ASN, prefix, and anomaly fields in the details panel.",
  "Check recommendation cards for investigation hints.",
  "Compare another IP to validate routing consistency.",
];

const PRACTICES = [
  "Treat country values as allocation metadata, not geolocation.",
  "Investigate invalid RPKI status before trusting route origin.",
  "Use bogon and anomaly reasons to prioritize alerts.",
  "Pair map output with ASN panel for full context.",
];

export default function Guide() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-7xl flex-col gap-5 px-4 py-8 md:px-6 lg:px-8">
      <section className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="inline-flex rounded-lg bg-teal-50 p-2 text-teal-700">
          <BookOpenCheck size={18} />
        </div>
        <h1 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">Getting Started Guide</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 md:text-base">
          Follow this flow for a reliable first session and clearer interpretation of IPNetDB-backed routing data.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="animate-fade-up stagger-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 inline-flex rounded-lg bg-indigo-50 p-2 text-indigo-700">
            <ListChecks size={18} />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Recommended Workflow</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
            {STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>

        <article className="animate-fade-up stagger-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 inline-flex rounded-lg bg-emerald-50 p-2 text-emerald-700">
            <ShieldCheck size={18} />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Interpretation Practices</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
            {PRACTICES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="animate-fade-up stagger-3 rounded-2xl border border-teal-200 bg-teal-50 p-5">
        <h2 className="text-lg font-semibold text-teal-900">Continue to Workspace</h2>
        <p className="mt-2 text-sm leading-relaxed text-teal-800">
          Once you know the flow, continue with live lookups in the workspace.
        </p>
        <Link
          to="/workspace"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
        >
          Open workspace
          <ArrowRight size={16} />
        </Link>
      </section>
    </main>
  );
}