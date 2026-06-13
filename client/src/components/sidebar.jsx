import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Swords,
  Bot,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/warroom", label: "War Room", icon: Swords },
  { to: "/phantom", label: "Phantom AI", icon: Bot },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-56"
      } shrink-0 min-h-screen bg-zinc-900 border-r border-zinc-800 flex flex-col transition-all duration-300`}
    >
      <div className="flex items-center justify-end p-3 border-b border-zinc-800">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors duration-200"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex flex-col gap-1 p-2 flex-1">
        {NAV_LINKS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-transparent"
              }`
            }
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
