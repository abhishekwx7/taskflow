import { NavLink } from "react-router-dom";
import { LayoutDashboard, ListTodo, LogOut, CheckCheck } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-[#343941] bg-[#191C22]">
      {/* Branding */}
      <div className="flex items-center gap-3 border-b border-[#343941] px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#303642]">
          <CheckCheck className="h-5 w-5 text-white" />
        </div>

        <div>
          <h1 className="text-lg font-bold tracking-tight text-[#F4F4F5]">
            TaskFlow
          </h1>
          <p className="text-xs text-gray-500">Project Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Workspace
        </p>

        <div className="space-y-1">
          {/* Dashboard */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#303642] text-[#F4F4F5]"
                  : "text-[#A1A1AA] hover:bg-[#272B33] hover:text-[#F4F4F5]"
              }`
            }
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </NavLink>

          {/* Tasks */}
          <NavLink
            to="/tasks"
            className={({ isActive }) =>
              `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            <ListTodo className="h-4 w-4" />
            Tasks
          </NavLink>
        </div>
      </nav>

      {/* Account and Logout */}
      <div className="mt-auto border-t border-[#343941] p-3">
        {user && (
          <div className="mb-3 flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#303642] text-xs font-semibold text-[#F4F4F5]">
              {user.name
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#858B98]">
                {user.name}
              </p>
              <p className="text-xs text-gray-500">My Workspace</p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#A1A1AA] transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
