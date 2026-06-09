import { useState } from "react";

import ASNPanel from "../components/ASNPanel";
import IPSearch from "../components/IPSearch";
import MapView from "../components/MapView";
import { lookupIP, lookupMapPoint } from "../services/api";

export default function Home() {
  const [lookup, setLookup] = useState(null);
  const [point, setPoint] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSearch = async (ip) => {
    setError("");
    setLoading(true);

    try {
      const [lookupData, mapData] = await Promise.all([
        lookupIP(ip),
        lookupMapPoint(ip),
      ]);

      setLookup(lookupData);
      setPoint(mapData);

      if (lookupData.found && (mapData.lat == null || mapData.lon == null)) {
        setError("IP resolved, but location is unavailable in this dataset.");
      }
    } catch (err) {
      setLookup(null);
      setPoint(null);
      setError(err.message || "Lookup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="layout">
      <header>
        <h1>Grafinet</h1>
        <p>Internet Routing Visualization System using IPNetDB and Leaflet.</p>
      </header>

      <IPSearch onSearch={onSearch} loading={loading} />

      <section className="content">
        <MapView point={point} />
        <ASNPanel data={lookup} error={error} />
      </section>

      <footer>
        <small>Internet information provided by IPNetDB.com</small>
      </footer>
    </main>
  );
}
