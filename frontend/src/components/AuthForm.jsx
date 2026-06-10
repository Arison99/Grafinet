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
    <section className="mx-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">
        {mode === "signup" ? "Create Account" : "Login"}
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        {mode === "signup"
          ? "Register to access Grafinet routing tools."
          : "Login to use IP lookup and map visualization."}
      </p>

      {notice && (
        <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
          {notice}
        </div>
      )}

      <form onSubmit={submit} className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Username
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            minLength={3}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          />
        </label>

        {mode === "signup" && (
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            />
          </label>
        )}

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          />
        </label>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-70"
        >
          {loading ? "Please wait..." : mode === "signup" ? "Sign up" : "Login"}
        </button>
      </form>

      <button
        className="mt-4 text-sm font-semibold text-teal-700 transition hover:text-teal-800"
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
