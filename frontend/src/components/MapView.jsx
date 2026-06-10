import { useEffect } from "react";

import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";

function FitToData({ hasPoint, point, routePoints, mode }) {
  const map = useMap();

  useEffect(() => {
    if (mode === "simulation" && routePoints.length > 1) {
      map.fitBounds(routePoints, { padding: [30, 30] });
      return;
    }

    if (mode === "simulation" && routePoints.length === 1) {
      map.flyTo(routePoints[0], 4, { duration: 0.5 });
      return;
    }

    if (mode === "lookup" && hasPoint) {
      map.flyTo([point.lat, point.lon], 4, { duration: 0.5 });
    }
  }, [map, hasPoint, point, routePoints, mode]);

  return null;
}

export default function MapView({ point, lookup, simulation, mode = "lookup" }) {
  const hasPoint = point && point.found && point.lat != null && point.lon != null;
  const cityName = lookup?.geo_city?.city?.names?.en;
  const countryName = lookup?.geo_city?.country?.names?.en;
  const timezone = lookup?.geo_city?.location?.time_zone;
  const routeHops = (simulation?.mapHops || []).filter(
    (hop) => hop?.lat != null && hop?.lon != null,
  );
  const routePoints = routeHops.map((hop) => [hop.lat, hop.lon]);
  const showSimulation = mode === "simulation";
  const showLookup = mode === "lookup";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        className="h-[360px] w-full md:h-[420px] lg:h-[100%] lg:min-h-[620px]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitToData hasPoint={hasPoint} point={point} routePoints={routePoints} mode={mode} />

        {showSimulation && routePoints.length > 1 && (
          <Polyline positions={routePoints} pathOptions={{ color: "#0f766e", weight: 4, opacity: 0.8 }} />
        )}

        {showSimulation && routeHops.map((hop) => (
          <CircleMarker
            key={`${hop.hop}-${hop.sample_ip || hop.asn || hop.country || "node"}`}
            center={[hop.lat, hop.lon]}
            radius={8}
            pathOptions={{
              color: hop.type === "source"
                ? "#0f766e"
                : hop.type === "destination"
                  ? "#7c3aed"
                  : hop.type === "peering"
                    ? "#b45309"
                    : "#475569",
              fillColor: hop.type === "source"
                ? "#14b8a6"
                : hop.type === "destination"
                  ? "#a78bfa"
                  : hop.type === "peering"
                    ? "#f59e0b"
                    : "#94a3b8",
              fillOpacity: 0.95,
              weight: 2,
            }}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              {hop.hop}
            </Tooltip>
            <Popup>
              <div>
                <div className="font-semibold">Hop {hop.hop} ({hop.type})</div>
                <div>ASN: {hop.asn ? `AS${hop.asn}` : "N/A"}</div>
                <div>Entity: {hop.entity || "Unknown"}</div>
                <div>Country: {hop.country || "N/A"}</div>
                <div>Sample IP: {hop.sample_ip || "N/A"}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {showLookup && hasPoint && (
          <Marker position={[point.lat, point.lon]}>
            <Popup>
              <div>
                <div>ASN: {point.asn?.number || "N/A"}</div>
                <div>Org: {point.asn?.entity || "N/A"}</div>
                <div>Prefix: {point.prefix || "N/A"}</div>
                <div>Place: {[cityName, countryName].filter(Boolean).join(", ") || "N/A"}</div>
                <div>Timezone: {timezone || "N/A"}</div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
