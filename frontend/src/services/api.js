const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

async function request(path, token) {
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { headers });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody?.detail || "Request failed";
    throw new Error(message);
  }

  return response.json();
}

async function requestWithBody(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody?.detail || "Request failed";
    throw new Error(message);
  }

  return response.json();
}

async function requestWithToken(path, method, token) {
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody?.detail || "Request failed";
    throw new Error(message);
  }

  return response.json();
}

export function lookupIP(ip, token) {
  return request(`/ip/${ip}`, token);
}

export function lookupMapPoint(ip, token) {
  return request(`/map/point/${ip}`, token);
}

export function signupUser(payload) {
  return requestWithBody("/auth/signup", payload);
}

export function loginUser(payload) {
  return requestWithBody("/auth/login", payload);
}

export function logoutUser(token) {
  return requestWithToken("/auth/logout", "POST", token);
}
