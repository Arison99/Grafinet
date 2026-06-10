import { Link } from "react-router-dom";
import { ArrowLeft, Compass, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-4xl flex-col items-center justify-center gap-4 px-4 py-10 text-center">
      <div className="animate-fade-up inline-flex rounded-full bg-rose-100 p-3 text-rose-700">
        <SearchX size={24} />
      </div>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">404</p>
      <h1 className="animate-fade-up stagger-1 text-3xl font-bold text-slate-900">Page not found</h1>
      <p className="max-w-xl text-sm text-slate-600 md:text-base">
        The page you requested does not exist. Continue to the overview or jump directly into the workspace.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2 animate-fade-up stagger-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Overview
        </Link>
        <Link
          to="/workspace"
          className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
        >
          <Compass size={16} />
          Workspace
        </Link>
      </div>
    </main>
  );
}