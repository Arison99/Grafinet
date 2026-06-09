import { useState } from "react";

import { loginUser, signupUser } from "../services/api";

export default function AuthForm({ onAuthSuccess, notice }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = { username, password };
      const response =
        mode === "signup"
          ? await signupUser({ ...payload, email })
          : await loginUser(payload);

      onAuthSuccess(response);
      setPassword("");
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-card">
      <h2>{mode === "signup" ? "Create Account" : "Login"}</h2>
      <p className="auth-subtitle">
        {mode === "signup"
          ? "Register to access Grafinet routing tools."
          : "Login to use IP lookup and map visualization."}
      </p>

      {notice && <div className="panel muted">{notice}</div>}

      <form onSubmit={submit} className="auth-form">
        <label>
          Username
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            minLength={3}
          />
        </label>

        {mode === "signup" && (
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
        )}

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
          />
        </label>

        {error && <div className="panel error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." : mode === "signup" ? "Sign up" : "Login"}
        </button>
      </form>

      <button
        className="auth-switch"
        type="button"
        onClick={() => {
          setError("");
          setMode(mode === "signup" ? "login" : "signup");
        }}
      >
        {mode === "signup"
          ? "Already have an account? Login"
          : "Need an account? Sign up"}
      </button>
    </section>
  );
}
