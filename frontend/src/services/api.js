const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

async function request(path) {
  const response = await fetch(`${API_BASE}${path}`);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody?.detail || "Request failed";
    throw new Error(message);
  }

  return response.json();
}

export function lookupIP(ip) {
  return request(`/ip/${ip}`);
}

export function lookupMapPoint(ip) {
  return request(`/map/point/${ip}`);
}
