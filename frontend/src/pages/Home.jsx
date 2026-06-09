import { useState } from "react";

import ASNPanel from "../components/ASNPanel";
import AuthForm from "../components/AuthForm";
import IPSearch from "../components/IPSearch";
import MapView from "../components/MapView";
import { logoutUser, lookupIP, lookupMapPoint } from "../services/api";

export default function Home() {
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

  const onSearch = async (ip) => {
    if (!auth?.token) {
      setError("Please login again.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const [lookupData, mapData] = await Promise.all([
        lookupIP(ip, auth.token),
        lookupMapPoint(ip, auth.token),
      ]);

      setLookup(lookupData);
      setPoint(mapData);

      if (lookupData.found && (mapData.lat == null || mapData.lon == null)) {
        setError("IP resolved, but location is unavailable in this dataset.");
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

  return (
    <main className="layout">
      <header>
        <h1>Grafinet</h1>
        <p>Internet Routing Visualization System using IPNetDB and Leaflet.</p>
        {auth && (
          <div className="session-bar">
            <span>Logged in as {auth.username}</span>
            <button type="button" onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </header>

      {!auth ? (
        <AuthForm onAuthSuccess={onAuthSuccess} notice={authNotice} />
      ) : (
        <>
          <IPSearch onSearch={onSearch} loading={loading} />

          <section className="content">
            <MapView point={point} />
            <ASNPanel data={lookup} error={error} />
          </section>
        </>
      )}

      <footer>
        <small>Internet information provided by IPNetDB.com</small>
      </footer>
    </main>
  );
}
