const QUICK_IPS = ["8.8.8.8", "1.1.1.1", "9.9.9.9", "208.67.222.222"];

function scoreRecommendation({ auth, lookup, error }) {
  const reasons = [];
  let score = 40;

  if (auth) {
    score += 15;
    reasons.push("Authenticated session enables live protected lookups.");
  } else {
    reasons.push("Login is required before recommendations can execute lookups.");
  }

  if (lookup?.found) {
    score += 20;
    reasons.push("Latest lookup returned valid routing data.");
  }

  if (lookup?.asn_db) {
    score += 10;
    reasons.push("Route ownership context is fully available for this lookup.");
  }

  if (lookup?.asn_db?.in_use) {
    score += 8;
    reasons.push("ASN is marked in_use, indicating active routing participation.");
  }

  if ((lookup?.asn_db?.peers?.length || 0) > 0) {
    score += 5;
    reasons.push("Known peering relationships provide stronger context.");
  }

  if ((lookup?.asn_db?.ipv4_prefixes?.length || 0) + (lookup?.asn_db?.ipv6_prefixes?.length || 0) > 0) {
    score += 5;
    reasons.push("Advertised prefixes are available for ASN verification.");
  }

  if (lookup?.rpki_status === "valid") {
    score += 10;
    reasons.push("Route has valid RPKI status.");
  }

  if (lookup?.prefix_bogon) {
    score -= 25;
    reasons.push("Bogon prefix lowers confidence heavily.");
  }

  if (lookup?.rpki_status === "invalid") {
    score -= 20;
    reasons.push("RPKI invalid route lowers trust.");
  }

  if (lookup?.anomaly?.anomaly) {
    score -= 15;
    reasons.push("Anomaly detection flagged this route.");
  }

  if (error) {
    score = Math.max(5, score - 30);
    reasons.push("Current error state reduces recommendation confidence.");
  }

  const normalized = Math.max(0, Math.min(100, score));
  return { score: normalized, reasons };
}

function getRecommendations({ auth, lookup, error, lastLookupIp }) {
  const cards = [];

  cards.push({
    title: "Start with known resolver IPs",
    text: "Use one-click examples to verify your session and see baseline routing behavior quickly.",
    level: "info",
  });

  if (!auth) {
    cards.push({
      title: "Authentication required before lookup",
      text: "Log in to access protected IP and map endpoints. This keeps routing data access controlled.",
      level: "warn",
    });
    return cards;
  }

  if (error) {
    cards.push({
      title: "Resolve this lookup error first",
      text: "Try a known-valid IP format and rerun. If token-related, re-authenticate and repeat the query.",
      level: "warn",
    });
    return cards;
  }

  if (!lookup) {
    cards.push({
      title: "Follow this first-run sequence",
      text: "1) Run a resolver lookup. 2) Confirm map marker appears. 3) Compare ASN, prefix, and anomaly fields.",
      level: "info",
    });
    return cards;
  }

  if (!lookup.found) {
    cards.push({
      title: "No record returned",
      text: "Try another public IP next. Some IPs do not have a routable record at this time.",
      level: "warn",
    });
    return cards;
  }

  cards.push({
    title: `Review results for ${lastLookupIp || lookup.ip}`,
    text: "Check allocationRegistry, asSingle, prefix_origins, and ASN in_use status to confirm traffic origin assumptions.",
    level: "info",
  });

  cards.push({
    title: "Prefix utilization check",
    text: `prefix=${lookup.prefix || "N/A"}, prefix_origins=${lookup.prefix_origins?.length || 0}, bogon=${lookup.prefix_bogon ? "true" : "false"}`,
    level: lookup.prefix_bogon ? "danger" : "info",
  });

  cards.push({
    title: "ASN utilization check",
    text: `in_use=${lookup.asn_db?.in_use ?? "N/A"}, peers=${lookup.asn_db?.peers?.length || 0}, v4=${lookup.asn_db?.ipv4_prefixes?.length || 0}, v6=${lookup.asn_db?.ipv6_prefixes?.length || 0}`,
    level: lookup.asn_db?.in_use ? "info" : "warn",
  });

  if (lookup.rpki_status === "invalid") {
    cards.push({
      title: "RPKI validation is invalid",
      text: "Treat this route as high-risk. Validate origin ASN and investigate before trusting this path.",
      level: "danger",
    });
  }

  if (lookup.prefix_bogon) {
    cards.push({
      title: "Bogon prefix detected",
      text: "This prefix appears unroutable in normal allocation space. Investigate filtering and source integrity.",
      level: "danger",
    });
  }

  if (lookup.anomaly?.anomaly) {
    cards.push({
      title: "Anomaly score needs attention",
      text: `Reasons: ${(lookup.anomaly.reasons || []).join(", ") || "unavailable"}`,
      level: "warn",
    });
  }

  if (!lookup.ix) {
    cards.push({
      title: "No IX data available",
      text: "Lack of internet exchange context is common. Cross-check the ASN panel and compare with another IP.",
      level: "info",
    });
  }

  return cards;
}

export default function RecommendationPanel({
  auth,
  lookup,
  error,
  loading,
  lastLookupIp,
  onRecommend,
  onOpenOnboarding,
}) {
  const confidence = scoreRecommendation({ auth, lookup, error });
  const cards = getRecommendations({ auth, lookup, error, lastLookupIp }).slice(0, 3);

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      aria-label="Recommendations"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Recommendations</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {confidence.score}/100
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK_IPS.map((ip) => (
          <button
            key={ip}
            type="button"
            className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!auth || loading}
            onClick={() => onRecommend(ip)}
          >
            {ip}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {cards.map((card) => (
          <button
            key={`${card.title}-${card.level}`}
            type="button"
            onClick={() => onRecommend(lastLookupIp || lookup?.ip || QUICK_IPS[0])}
            disabled={!auth || loading}
            className="block w-full rounded-xl border border-slate-200 px-3 py-3 text-left transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="text-sm font-semibold text-slate-900">{card.title}</div>
            <div className="mt-1 text-xs leading-relaxed text-slate-500">{card.text}</div>
          </button>
        ))}
      </div>

      <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900">
          Why
        </summary>
        <ul className="mt-2 space-y-1 text-sm text-slate-600">
          {confidence.reasons.map((reason) => (
            <li key={reason}>• {reason}</li>
          ))}
        </ul>
        <button
          type="button"
          className="mt-3 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          onClick={onOpenOnboarding}
        >
          Open help
        </button>
      </details>
    </section>
  );
}