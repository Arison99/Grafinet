import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

export default function MapView({ point }) {
  const hasPoint = point && point.found && point.lat != null && point.lon != null;

  return (
    <div className="map-shell">
      <MapContainer center={[20, 0]} zoom={2} minZoom={2} className="map-canvas">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {hasPoint && (
          <Marker position={[point.lat, point.lon]}>
            <Popup>
              <div>
                <div>ASN: {point.asn?.number || "N/A"}</div>
                <div>Org: {point.asn?.entity || "N/A"}</div>
                <div>Prefix: {point.prefix || "N/A"}</div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
