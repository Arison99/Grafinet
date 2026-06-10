import { useState } from "react";

import { simulateRoute } from "../services/api";

const HOP_STYLES = {
  source: "border-teal-300 bg-teal-50 text-teal-900",
  peering: "border-amber-300 bg-amber-50 text-amber-900",
  transit: "border-slate-300 bg-slate-50 text-slate-800",
  destination: "border-purple-300 bg-purple-50 text-purple-900",
};

const HOP_BADGE = {
  source: "bg-teal-100 text-teal-800",
  peering: "bg-amber-100 text-amber-800",
  transit: "bg-slate-200 text-slate-700",
  destination: "bg-purple-100 text-purple-800",
};

const HOP_DOT = {
  source: "border-teal-400 text-teal-700",
  peering: "border-amber-400 text-amber-700",
  transit: "border-slate-400 text-slate-600",
  destination: "border-purple-400 text-purple-700",
};

export default function RouteSimulation({ auth, onHopSearch, onResultChange }) {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSimulate = async (event) => {
    event.preventDefault();
    if (!auth?.token || !source.trim() || !destination.trim()) {
      return;
    }

    setError("");
    setLoading(true);
    try {
      const data = await simulateRoute(
        { source: source.trim(), destination: destination.trim() },
        auth.token,
      );
      setResult(data);
      onResultChange?.(data);
    } catch (err) {
      setError(err.message || "Simulation failed");
      setResult(null);
      onResultChange?.(null);
    } finally {
      setLoading(false);
    }
  };

  const prefillExample = (src, dst) => {
    setSource(src);
    setDestination(dst);
    setResult(null);
    setError("");
    onResultChange?.(null);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Route Simulation</h2>
          <p className="mt-1 text-xs text-slate-500">
            Explore how traffic <em>might</em> hop from one ASN to another. Ignores peer rules — just for fun.
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
          Simulated
        </span>
      </div>

      <form className="mt-3 grid gap-2" onSubmit={handleSimulate}>
        <input
          value={source}
          onChange={(event) => setSource(event.target.value)}
          placeholder="Source — IP, AS15169, or country (US)"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
        />
        <input
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          placeholder="Destination — IP, AS13335, or country (JP)"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
        />
        <button
          type="submit"
          disabled={loading || !source.trim() || !destination.trim() || !auth}
          className="w-full rounded-lg bg-teal-700 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Simulating..." : "Simulate Path"}
        </button>
      </form>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="text-[11px] text-slate-400">Try:</span>
        {[
          ["US", "JP", "US → JP"],
          ["DE", "BR", "DE → BR"],
          ["8.8.8.8", "SG", "8.8.8.8 → SG"],
        ].map(([src, dst, label]) => (
          <button
            key={label}
            type="button"
            onClick={() => prefillExample(src, dst)}
            className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 transition hover:bg-slate-100"
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-4">
          <div className="mb-3 flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>{result.hop_count} hops</span>
            <span className="max-w-full break-words italic opacity-70 sm:max-w-[70%] sm:text-right">
              {result.note}
            </span>
          </div>

          <div className="relative space-y-2 pl-11">
            <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-200" />

            {result.hops.map((hop) => (
              <div key={hop.hop} className="relative flex items-start gap-3">
                <div
                  className={`absolute -left-[1.5rem] z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 bg-white text-[11px] font-bold ${HOP_DOT[hop.type] || HOP_DOT.transit}`}
                >
                  {hop.hop}
                </div>

                <button
                  type="button"
                  onClick={() => hop.sample_ip && onHopSearch(hop.sample_ip)}
                  disabled={!hop.sample_ip}
                  className={[
                    "w-full min-w-0 rounded-xl border px-3 py-2.5 text-left text-xs transition",
                    HOP_STYLES[hop.type] || HOP_STYLES.transit,
                    hop.sample_ip
                      ? "cursor-pointer hover:opacity-80"
                      : "cursor-default opacity-80",
                  ].join(" ")}
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                    <span className="min-w-0 break-words font-semibold">
                      {hop.asn ? `AS${hop.asn}` : "Unknown"}{" "}
                      <span className="font-normal text-current opacity-70">· {hop.country || "?"}</span>
                    </span>
                    <span
                      className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${HOP_BADGE[hop.type] || HOP_BADGE.transit}`}
                    >
                      {hop.type}
                    </span>
                  </div>
                  <div className="mt-0.5 break-words opacity-70">{hop.entity || "Unknown entity"}</div>
                  {hop.sample_ip && (
                    <div className="mt-0.5 break-all text-[11px] opacity-50">tap to look up {hop.sample_ip}</div>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
