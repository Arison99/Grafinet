import { useState } from "react";

export default function IPSearch({ onSearch, loading, compact = false }) {
  const [ip, setIp] = useState("");

  const submit = (event) => {
    event.preventDefault();
    if (!ip.trim()) {
      return;
    }
    onSearch(ip.trim());
  };

  return (
    <form
      className={[
        "grid gap-3 rounded-2xl border border-slate-200 bg-white shadow-sm",
        compact ? "p-3 md:grid-cols-[minmax(0,1fr)_auto]" : "p-4 md:grid-cols-[minmax(0,1fr)_auto]",
      ].join(" ")}
      onSubmit={submit}
    >
      <input
        value={ip}
        onChange={(event) => setIp(event.target.value)}
        placeholder="IP address"
        aria-label="IP address"
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
      />
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-70"
      >
        {loading ? "Looking up..." : "Lookup"}
      </button>
    </form>
  );
}
