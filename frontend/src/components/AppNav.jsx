import { NavLink } from "react-router-dom";
import { BookOpenCheck, Gauge, ShieldCheck } from "lucide-react";

const PRIMARY_ITEMS = [
  { to: "/workspace", label: "Workspace", icon: Gauge },
  { to: "/guide", label: "Guide", icon: BookOpenCheck },
  { to: "/governance", label: "Governance", icon: ShieldCheck },
];

export default function AppNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 py-2.5 md:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-2.5">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-teal-700 text-xs font-bold text-white">
            G
          </div>
          <span className="text-sm font-bold tracking-wide text-slate-900">Grafinet</span>
        </NavLink>

        <div className="flex items-center gap-1">
          {PRIMARY_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition",
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  ].join(" ")
                }
              >
                <Icon size={14} strokeWidth={2.2} />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </header>
  );
}