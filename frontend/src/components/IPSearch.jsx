import { useState } from "react";

export default function IPSearch({ onSearch, loading }) {
  const [ip, setIp] = useState("");

  const submit = (event) => {
    event.preventDefault();
    if (!ip.trim()) {
      return;
    }
    onSearch(ip.trim());
  };

  return (
    <form className="search" onSubmit={submit}>
      <input
        value={ip}
        onChange={(event) => setIp(event.target.value)}
        placeholder="Enter IP address (example: 8.8.8.8)"
        aria-label="IP address"
      />
      <button type="submit" disabled={loading}>
        {loading ? "Looking up..." : "Lookup"}
      </button>
    </form>
  );
}
