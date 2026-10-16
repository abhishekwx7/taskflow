import { NavLink, Link } from "react-router-dom";
import { LayoutDashboard, ListTodo, LogOut, CheckCheck, X } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `group flex w-full items-center gap-3 rounded-xl px-3 py-3
    text-sm font-medium transition-all duration-200
    focus-visible:outline-2 focus-visible:outline-offset-2
    focus-visible:outline-blue-500 ${
      isActive
        ? "border border-[#354665] bg-[#29354D] text-[#A7BFFF]"
        : "border border-transparent text-[#9CA3B5] hover:bg-[#202530] hover:text-[#F4F5F8]"
    }`;

  const initials = user?.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/65 backdrop-blur-[2px] md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        aria-label="Workspace sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-64 shrink-0 flex-col
        border-r border-[#252936] bg-[#12151D]
        transition-transform duration-300 ease-in-out
        md:sticky md:top-0 md:h-screen md:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Branding */}
        <div className="flex items-center gap-3 border-b border-[#252936] px-5 py-6">
          <Link
            to="/"
            onClick={onClose}
            className="flex min-w-0 items-center gap-3 rounded-lg
            focus-visible:outline-2 focus-visible:outline-offset-4
            focus-visible:outline-blue-500"
          >
            {/* Logo */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#252B3A]">
              <CheckCheck
                size={21}
                strokeWidth={2.2}
                className="text-[#F4F5F8]"
              />
            </div>

            {/* Brand */}
            <div className="min-w-0">
              <h1 className="text-lg font-bold tracking-tight text-[#F4F5F8]">
                TaskFlow
              </h1>

              <p className="mt-0.5 text-xs text-[#858DA0]">
                Project Management
              </p>
            </div>
          </Link>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="ml-auto rounded-lg p-2 text-[#9CA3B5]
            transition-colors hover:bg-[#202530] hover:text-white
            focus-visible:outline-2 focus-visible:outline-blue-500
            md:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <nav
          aria-label="Workspace navigation"
          className="min-h-0 flex-1 overflow-y-auto px-3 py-7"
        >
          <p className="mb-4 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#858DA0]">
            Workspace
          </p>

          <div className="space-y-1.5">
            {/* Dashboard */}
            <NavLink to="/dashboard" onClick={onClose} className={navLinkClass}>
              <LayoutDashboard size={18} className="shrink-0" />
              <span>Dashboard</span>
            </NavLink>

            {/* All Tasks */}
            <NavLink to="/tasks" end onClick={onClose} className={navLinkClass}>
              <ListTodo size={18} className="shrink-0" />
              <span>Tasks</span>
            </NavLink>
          </div>
        </nav>

        {/* Account and Logout */}
        <div className="mt-auto border-t border-[#252936] p-3">
          {/* Profile */}
          {user && (
            <div className="mb-2 flex items-center gap-3 rounded-xl border border-[#2B3040] bg-[#1A1E29] p-3">
              {/* Avatar */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#354665] bg-[#29354D] text-sm font-semibold text-[#A7BFFF]">
                {initials}
              </div>

              {/* User Information */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#F4F5F8]">
                  {user.name}
                </p>

                <p className="mt-1 text-xs text-[#858DA0]">My Workspace</p>
              </div>

              {/* Signed-In Indicator */}
              <span
                title="Signed in"
                aria-label="Signed in"
                className="h-2 w-2 shrink-0 rounded-full bg-[#65C89B]"
              />
            </div>
          )}

          {/* Logout */}
          <button
            type="button"
            onClick={() => {
              onClose();
              logout();
            }}
            className="group flex w-full items-center gap-3 rounded-xl
            border border-transparent px-3 py-3 text-sm font-medium
            text-[#9CA3B5] transition-all duration-200
            hover:border-red-500/15 hover:bg-red-500/10
            hover:text-red-400 focus-visible:outline-2
            focus-visible:outline-offset-2 focus-visible:outline-red-400"
          >
            <LogOut
              size={18}
              className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
            />

            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
