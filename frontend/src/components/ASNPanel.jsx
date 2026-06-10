function Value({ value }) {
  if (value == null || value === "") {
    return <span className="text-right text-slate-400">N/A</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-right text-slate-400">N/A</span>;
    }
    return (
      <span className="text-right text-slate-800 break-all">{value.join(", ")}</span>
    );
  }

  if (typeof value === "object") {
    return (
      <pre className="max-w-[22rem] overflow-x-auto whitespace-pre-wrap rounded-md bg-slate-50 px-2 py-1 text-right text-xs text-slate-700">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return <span className="text-right text-slate-800 break-all">{String(value)}</span>;
}

function Field({ label, value, noBorder = false }) {
  return (
    <p
      className={`flex items-start justify-between gap-3 py-2 text-sm ${
        noBorder ? "" : "border-b border-slate-100"
      }`}
    >
      <strong className="font-medium text-slate-500">{label}</strong>
      <Value value={value} />
    </p>
  );
}

export default function ASNPanel({ data, error }) {
  const ipv4Count = data?.asn_db?.ipv4_prefixes?.length ?? 0;
  const ipv6Count = data?.asn_db?.ipv6_prefixes?.length ?? 0;
  const peerCount = data?.asn_db?.peers?.length ?? 0;
  const geoIso = data?.geo_country?.country?.iso_code || data?.geo_country?.registered_country?.iso_code;
  const geoOrg = data?.geo_asn?.autonomous_system_organization;
  const cityName = data?.geo_city?.city?.names?.en;
  const countryName = data?.geo_city?.country?.names?.en;
  const subdivisionName = data?.geo_city?.subdivisions?.[0]?.names?.en;
  const postalCode = data?.geo_city?.postal?.code;
  const timezone = data?.geo_city?.location?.time_zone;
  const accuracyRadius = data?.geo_city?.location?.accuracy_radius;
  const latitude = data?.latitude ?? data?.geo_city?.location?.latitude;
  const longitude = data?.longitude ?? data?.geo_city?.location?.longitude;


  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
        Search an IP to view ASN details.
      </div>
    );
  }

  if (!data.found) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow-sm">
        No routing record found for {data.ip}.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Routing Details</h2>

      <div className="mt-3 rounded-xl border border-slate-200 p-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-600">
          Route Attributes (from IP lookup)
        </h3>
        <div className="mt-2">
          <Field label="IP" value={data.ip} />
          <Field label="allocation" value={data.allocation} />
          <Field label="allocationRegistry" value={data.allocation_registry} />
          <Field label="asSingle" value={data.asn?.number} />
          <Field label="prefix" value={data.prefix} />
          <Field label="prefix_origins" value={data.prefix_origins} />
          <Field label="prefix_bogon" value={data.prefix_bogon} />
          <Field label="rpki_status" value={data.rpki_status} />
          <Field label="Country fallback" value={geoIso} />
          <Field label="ix" value={data.ix} noBorder />
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-slate-200 p-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-600">
          Network Ownership & Reachability
        </h3>
        <div className="mt-2">
          <Field label="as" value={data.asn_db?.as ?? data.asn?.number} />
          <Field label="entity" value={data.asn_db?.entity ?? data.asn?.entity} />
          <Field label="Organization fallback" value={geoOrg} />
          <Field label="in_use" value={data.asn_db?.in_use} />
          <Field label="ipv4_prefixes" value={data.asn_db?.ipv4_prefixes} />
          <Field label="ipv6_prefixes" value={data.asn_db?.ipv6_prefixes} />
          <Field label="peers" value={data.asn_db?.peers} />
          <Field label="ix" value={data.asn_db?.ix} noBorder />
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-slate-200 p-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-600">
          Utilization Insights
        </h3>
        <div className="mt-2">
          <Field label="IPv4 advertised count" value={ipv4Count} />
          <Field label="IPv6 advertised count" value={ipv6Count} />
          <Field label="Peer count" value={peerCount} />
          <Field
            label="Operational state"
            value={data.asn_db?.in_use ? "Active ASN with route visibility" : "Not active / unknown"}
            noBorder
          />
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-slate-200 p-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-600">
          Location Intelligence
        </h3>
        <div className="mt-2">
          <Field label="city" value={cityName} />
          <Field label="subdivision" value={subdivisionName} />
          <Field label="country" value={countryName} />
          <Field label="postal_code" value={postalCode} />
          <Field label="timezone" value={timezone} />
          <Field label="accuracy_radius_km" value={accuracyRadius} />
          <Field label="latitude" value={latitude} />
          <Field label="longitude" value={longitude} noBorder />
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-slate-200 p-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-600">
          Anomaly
        </h3>
        <div className="mt-2">
          <Field label="score" value={data.anomaly?.score ?? 0} />
          <Field label="anomaly" value={data.anomaly?.anomaly ? "Yes" : "No"} noBorder />
        </div>
      </div>

      {data.anomaly?.reasons?.length > 0 && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <strong className="font-semibold">Reasons:</strong> {data.anomaly.reasons.join(", ")}
        </div>
      )}
    </div>
  );
}
