export default function ASNPanel({ data, error }) {
  if (error) {
    return <div className="panel error">{error}</div>;
  }

  if (!data) {
    return <div className="panel muted">Search an IP to view ASN details.</div>;
  }

  if (!data.found) {
    return <div className="panel muted">No routing record found for {data.ip}.</div>;
  }

  return (
    <div className="panel">
      <h2>Routing Details</h2>
      <p>
        <strong>IP:</strong> {data.ip}
      </p>
      <p>
        <strong>ASN:</strong> {data.asn?.number || "N/A"}
      </p>
      <p>
        <strong>Organization:</strong> {data.asn?.entity || "N/A"}
      </p>
      <p>
        <strong>Prefix:</strong> {data.prefix || "N/A"}
      </p>
      <p>
        <strong>Country:</strong> {data.country || "N/A"}
      </p>
      <p>
        <strong>Anomaly Score:</strong> {data.anomaly?.score ?? 0}
      </p>
      <p>
        <strong>Anomaly:</strong> {data.anomaly?.anomaly ? "Yes" : "No"}
      </p>
      {data.anomaly?.reasons?.length > 0 && (
        <p>
          <strong>Reasons:</strong> {data.anomaly.reasons.join(", ")}
        </p>
      )}
    </div>
  );
}
