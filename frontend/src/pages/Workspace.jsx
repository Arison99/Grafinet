import { useRef, useState } from "react";

import ASNPanel from "../components/ASNPanel";
import AuthForm from "../components/AuthForm";
import IPSearch from "../components/IPSearch";
import MapView from "../components/MapView";
import OnboardingModal from "../components/OnboardingModal";
import RecommendationPanel from "../components/RecommendationPanel";
import RouteSimulation from "../components/RouteSimulation";
import {
  fetchApiRequestLogs,
  logoutUser,
  lookupIP,
  lookupMapPoint,
  searchCountryAsns,
} from "../services/api";

function StatCard({ label, value, tone = "slate" }) {
  const toneMap = {
    slate: "border-slate-200 bg-white text-slate-900",
    teal: "border-teal-200 bg-teal-50 text-teal-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    rose: "border-rose-200 bg-rose-50 text-rose-900",
  };

  return (
    <div className={`rounded-xl border px-4 py-3 shadow-sm ${toneMap[tone] || toneMap.slate}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold tracking-tight">{value}</p>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value || "Unavailable"}</p>
    </div>
  );
}

export default function Workspace() {
  const [auth, setAuth] = useState(() => {
    try {
      const cached = localStorage.getItem("grafinet-auth");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [lookup, setLookup] = useState(null);
  const [point, setPoint] = useState(null);
  const [error, setError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [lookupCount, setLookupCount] = useState(0);
  const [lastQueryAt, setLastQueryAt] = useState("");
  const [lastLookupIp, setLastLookupIp] = useState("");
  const [onboardingOpen, setOnboardingOpen] = useState(() => {
    try {
      return localStorage.getItem("grafinet-onboarding-dismissed") !== "1";
    } catch {
      return true;
    }
  });
  const [countryQuery, setCountryQuery] = useState("");
  const [countryResult, setCountryResult] = useState(null);
  const [countryLoading, setCountryLoading] = useState(false);
  const [countryError, setCountryError] = useState("");
  const [apiLogs, setApiLogs] = useState([]);
  const [apiLogLoading, setApiLogLoading] = useState(false);
  const [lookupHistory, setLookupHistory] = useState([]);
  const [savedIps, setSavedIps] = useState([]);
  const [showRoutingEvidence, setShowRoutingEvidence] = useState(false);
  const [simulationRoute, setSimulationRoute] = useState(null);
  const [mapMode, setMapMode] = useState("lookup");
  const simulationRequestRef = useRef(0);

  const onAuthSuccess = (payload) => {
    const session = {
      username: payload.username,
      token: payload.token,
    };
    setAuth(session);
    localStorage.setItem("grafinet-auth", JSON.stringify(session));
    setAuthNotice("");
  };

  const clearSession = () => {
    setAuth(null);
    setLookup(null);
    setPoint(null);
    setError("");
    localStorage.removeItem("grafinet-auth");
  };

  const logout = async () => {
    const token = auth?.token;
    if (token) {
      try {
        await logoutUser(token);
      } catch {
        // Session is still cleared locally even if remote logout fails.
      }
    }
    clearSession();
    setAuthNotice("");
  };

  const loadApiLogs = async (token) => {
    if (!token) {
      return;
    }
    setApiLogLoading(true);
    try {
      const response = await fetchApiRequestLogs(token, 20);
      setApiLogs(response.items || []);
    } catch {
      // Preserve the last successful log snapshot.
    } finally {
      setApiLogLoading(false);
    }
  };

  const onSearch = async (ip) => {
    if (!auth?.token) {
      setError("Please login again.");
      return;
    }

    setError("");
    setLoading(true);
    setLastLookupIp(ip);

    try {
      const [lookupData, mapData] = await Promise.all([
        lookupIP(ip, auth.token),
        lookupMapPoint(ip, auth.token),
      ]);

      setLookup(lookupData);
      setPoint(mapData);
      setMapMode("lookup");
      setLookupCount((value) => value + 1);
      setLastQueryAt(new Date().toLocaleString());
      setLookupHistory((current) => [ip, ...current.filter((entry) => entry !== ip)].slice(0, 8));
      setShowRoutingEvidence(true);
      void loadApiLogs(auth.token);

      if (lookupData.found && (mapData.lat == null || mapData.lon == null)) {
        setError("IP resolved, but precise map location is currently unavailable.");
      }
    } catch (err) {
      setLookup(null);
      setPoint(null);
      const message = (err.message || "").toLowerCase();
      if (
        message.includes("token") ||
        message.includes("authorization") ||
        message.includes("unauthorized")
      ) {
        clearSession();
        setAuthNotice("Session expired. Please login again.");
        setError("");
        return;
      }
      setError(err.message || "Lookup failed");
    } finally {
      setLoading(false);
    }
  };

  const onCountrySearch = async (event) => {
    event.preventDefault();
    if (!auth?.token) {
      setCountryError("Please login again.");
      return;
    }

    const country = countryQuery.trim().toUpperCase();
    if (!country) {
      return;
    }

    setCountryError("");
    setCountryLoading(true);
    try {
      const response = await searchCountryAsns(country, auth.token, 100);
      setCountryResult(response);
      void loadApiLogs(auth.token);
    } catch (err) {
      setCountryResult(null);
      setCountryError(err.message || "Country search failed");
    } finally {
      setCountryLoading(false);
    }
  };

  const onCountryAsnTap = async (item) => {
    if (!item?.sample_ip) {
      setCountryError("No sample IP available for this ASN yet.");
      return;
    }
    await onSearch(item.sample_ip);
  };

  const onSimulationResult = async (result) => {
    simulationRequestRef.current += 1;
    const requestId = simulationRequestRef.current;

    if (!result) {
      setSimulationRoute(null);
      return;
    }

    setSimulationRoute({ ...result, mapHops: [] });
    setMapMode("simulation");

    try {
      const hops = result.hops || [];
      const enrichedHops = await Promise.all(
        hops.map(async (hop) => {
          if (!hop?.sample_ip || !auth?.token) {
            return { ...hop, lat: null, lon: null };
          }

          try {
            const mapData = await lookupMapPoint(hop.sample_ip, auth.token);
            if (mapData?.found && mapData.lat != null && mapData.lon != null) {
              return { ...hop, lat: mapData.lat, lon: mapData.lon };
            }
          } catch {
            // Keep route simulation visible even when a hop cannot be geocoded.
          }

          return { ...hop, lat: null, lon: null };
        }),
      );

      if (simulationRequestRef.current !== requestId) {
        return;
      }

      setSimulationRoute({ ...result, mapHops: enrichedHops });
    } catch {
      if (simulationRequestRef.current === requestId) {
        setSimulationRoute({ ...result, mapHops: [] });
      }
    }
  };

  const saveCurrentIp = () => {
    const ip = lookup?.ip;
    if (!ip) {
      return;
    }
    setSavedIps((current) => [ip, ...current.filter((entry) => entry !== ip)].slice(0, 8));
  };

  const closeOnboarding = () => setOnboardingOpen(false);

  const completeOnboarding = () => {
    try {
      localStorage.setItem("grafinet-onboarding-dismissed", "1");
    } catch {
      // Ignore storage failures and continue UX flow.
    }
    setOnboardingOpen(false);
  };

  const hasLookupMap = Boolean(lookup && point);
  const hasSimulationMap = Boolean(simulationRoute);
  const resolvedMapMode = hasLookupMap && hasSimulationMap
    ? mapMode
    : hasSimulationMap
      ? "simulation"
      : "lookup";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col gap-4 px-4 py-6 md:px-6 lg:px-8">
      <header className="animate-fade-up rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
              Workspace
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Live routing lookup
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Fast IP lookup, ASN resolution, and route visualization.
            </p>
          </div>

          {auth && (
            <div className="grid gap-3 xl:min-w-[620px] xl:grid-cols-[minmax(0,1fr)_auto_auto]">
              <IPSearch onSearch={onSearch} loading={loading} compact />
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Status</p>
                <p className="mt-1 font-semibold">{loading ? "Processing" : "Authenticated"}</p>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-900">
                <span className="truncate">{auth.username}</span>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

        {authNotice && (
          <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            {authNotice}
          </div>
        )}
      </header>

      {!auth ? (
        <section className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <AuthForm onAuthSuccess={onAuthSuccess} notice={authNotice} />
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Workspace structure</h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
              <li>• Search and map stay on this page only.</li>
              <li>• Policy, SLA, and compliance live in the governance page.</li>
              <li>• Guidance and field reference live on dedicated support pages.</li>
            </ul>
          </div>
        </section>
      ) : (
        <section className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)_320px]">
          <aside className="grid content-start gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Session</h2>
              <div className="mt-3 grid gap-3">
                <StatCard label="State" value="Authenticated" tone="teal" />
                <StatCard
                  label="Lookup State"
                  value={loading ? "Processing" : lookup?.found ? "Complete" : error ? "Attention" : "Idle"}
                  tone={loading ? "teal" : error ? "rose" : lookup?.found ? "teal" : "slate"}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Query History</h2>
                <span className="text-xs text-slate-400">{lookupHistory.length}</span>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {lookupHistory.length ? (
                  lookupHistory.map((entry) => (
                    <button
                      key={entry}
                      type="button"
                      onClick={() => onSearch(entry)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      {entry}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No recent lookups yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Saved IPs</h2>
                <button
                  type="button"
                  onClick={saveCurrentIp}
                  disabled={!lookup?.ip}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Save
                </button>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {savedIps.length ? (
                  savedIps.map((entry) => (
                    <button
                      key={entry}
                      type="button"
                      onClick={() => onSearch(entry)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      {entry}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No saved IPs.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Country ASN Search</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                MMDB-backed country lookup. Tap an ASN row to load routing details.
              </p>
              <form className="mt-3 flex gap-2" onSubmit={onCountrySearch}>
                <input
                  value={countryQuery}
                  onChange={(event) => setCountryQuery(event.target.value)}
                  placeholder="Country code"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
                />
                <button
                  type="submit"
                  disabled={countryLoading}
                  className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-70"
                >
                  {countryLoading ? "Searching..." : "Search"}
                </button>
              </form>
              {countryError && (
                <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  {countryError}
                </p>
              )}
              {countryResult && (
                <div className="mt-3 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    <span>Country: {countryResult.country}</span>
                    <span>{countryResult.count} ASNs</span>
                  </div>
                  <div className="max-h-56 overflow-auto">
                    {(countryResult.items || []).slice(0, 25).map((item) => (
                      <button
                        key={`${item.country}-${item.asn}`}
                        type="button"
                        onClick={() => onCountryAsnTap(item)}
                        disabled={loading}
                        className="block w-full border-b border-slate-100 px-3 py-2 text-left text-xs transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-70"
                      >
                        <div className="font-semibold text-slate-800">AS{item.asn} · {item.entity || "Unknown"}</div>
                        <div className="mt-1 text-slate-500">hits: {item.hits} · observed IPs: {item.observed_ips}</div>
                        <div className="mt-1 text-[11px] text-slate-400">sample IP: {item.sample_ip || "N/A"}</div>
                      </button>
                    ))}
                    {countryResult.count === 0 && (
                      <div className="px-3 py-3 text-xs text-slate-500">No ASN records found in MMDB for this country code.</div>
                    )}
                  </div>
                </div>
              )}
              <RouteSimulation auth={auth} onHopSearch={onSearch} onResultChange={onSimulationResult} />

            </div>
          </aside>          <section className="grid content-start gap-4">
            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
              <SummaryCard label="Current IP" value={lookup?.ip || lastLookupIp} />
              <SummaryCard label="ASN" value={lookup?.asn?.number ? `AS${lookup.asn.number}` : null} />
              <SummaryCard label="Prefix" value={lookup?.prefix} />
              <SummaryCard label="Route Status" value={lookup?.rpki_status} />
              <SummaryCard
                label="Geo Point"
                value={point?.lat != null && point?.lon != null ? `${point.lat}, ${point.lon}` : null}
              />
              <SummaryCard label="Registry" value={lookup?.allocation_registry} />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
                {error}
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Analysis Canvas</h2>
                  <p className="mt-1 text-sm text-slate-500">The primary workspace for lookup interpretation and route visualization.</p>
                </div>
                <div className="flex items-center gap-2">
                  {hasLookupMap && hasSimulationMap && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setMapMode("lookup")}
                        className={`rounded-md px-2 py-1 font-semibold transition ${resolvedMapMode === "lookup" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-800"}`}
                      >
                        Lookup
                      </button>
                      <button
                        type="button"
                        onClick={() => setMapMode("simulation")}
                        className={`rounded-md px-2 py-1 font-semibold transition ${resolvedMapMode === "simulation" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-800"}`}
                      >
                        Simulation
                      </button>
                    </div>
                  )}
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {loading ? "Processing" : lookup?.found ? "Complete" : "Idle"}
                  </span>
                </div>
              </div>
            </div>

            {lookup || simulationRoute ? (
              <MapView point={point} lookup={lookup} simulation={simulationRoute} mode={resolvedMapMode} />
            ) : (
              <div className="grid min-h-[420px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-white text-sm text-slate-500 shadow-sm">
                Enter IP to visualize route
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Routing Evidence</h2>
                  <p className="mt-1 text-sm text-slate-500">Expanded only when deeper routing context is needed.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRoutingEvidence((value) => !value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {showRoutingEvidence ? "Collapse" : "Expand"}
                </button>
              </div>
              {showRoutingEvidence && <div className="mt-4"><ASNPanel data={lookup} error="" /></div>}
            </div>
          </section>

          <aside className="grid content-start gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Lookup Status</h2>
              <div className="mt-3 grid gap-3">
                <StatCard
                  label="State"
                  value={loading ? "Processing" : lookup?.found ? "Complete" : error ? "Attention" : "Idle"}
                  tone={loading ? "teal" : error ? "rose" : lookup?.found ? "teal" : "slate"}
                />
                <StatCard
                  label="Resolved Place"
                  value={lookup?.geo_city?.city?.names?.en || lookup?.geo_city?.country?.names?.en || "Unknown"}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Session Metrics</h2>
              <div className="mt-3 grid gap-3">
                <StatCard label="Queries" value={String(lookupCount)} />
                <StatCard label="Last Query" value={lastQueryAt || "No activity yet"} />
              </div>
            </div>

            {lookupCount > 0 && (
              <RecommendationPanel
                auth={auth}
                lookup={lookup}
                error={error}
                loading={loading}
                lastLookupIp={lastLookupIp}
                onRecommend={onSearch}
                onOpenOnboarding={() => setOnboardingOpen(true)}
              />
            )}

            <details className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <summary className="cursor-pointer list-none text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                Help
              </summary>
              <div className="mt-3 space-y-3 text-sm text-slate-600">
                <p>Run a lookup, inspect the summary cards, then expand routing evidence only if you need a deeper review.</p>
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  onClick={() => setOnboardingOpen(true)}
                >
                  Open onboarding
                </button>
              </div>
            </details>

            <details className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <summary className="cursor-pointer list-none text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                API Activity
              </summary>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500">Recent request logs and timing.</p>
                <button
                  type="button"
                  onClick={() => loadApiLogs(auth?.token)}
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  {apiLogLoading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
              <div className="mt-3 max-h-56 overflow-auto rounded-lg border border-slate-200">
                {(apiLogs || []).map((item) => (
                  <div key={item.request_id} className="border-b border-slate-100 px-3 py-2 text-xs">
                    <div className="font-semibold text-slate-800">{item.method} {item.path}</div>
                    <div className="mt-1 text-slate-500">status: {item.status_code} · {item.duration_ms.toFixed(1)} ms · user: {item.username || "anonymous"}</div>
                  </div>
                ))}
                {!apiLogs?.length && (
                  <div className="px-3 py-3 text-xs text-slate-500">No request logs yet for this session.</div>
                )}
              </div>
            </details>
          </aside>
        </section>
      )}

      <OnboardingModal
        open={onboardingOpen}
        canRunDemo={Boolean(auth) && !loading}
        onClose={closeOnboarding}
        onComplete={completeOnboarding}
        onRunDemo={() => onSearch("8.8.8.8")}
      />

      <footer className="mt-auto rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-xs text-slate-500 shadow-sm">
        <small>
          Internet routing insights are shown for operational awareness. Country values represent allocation context and may not reflect precise geolocation.
        </small>
      </footer>
    </main>
  );
}
