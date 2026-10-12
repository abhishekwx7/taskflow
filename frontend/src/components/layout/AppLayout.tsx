import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState, useEffect, useRef } from "react";
import { Menu } from "lucide-react";

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isSidebarOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key == "Escape") {
        setIsSidebarOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    if (!isSidebarOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isSidebarOpen]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="min-w-0 flex-1">
        {/* Mobile header */}

        <header className="flex items-center gap-3 border-b border-[#343941] bg-[#191C22] px-4 py-3 text-white md:hidden">
          <button
            ref={menuButtonRef}
            type="button"
            aria-label="Open sidebar"
            aria-expanded={isSidebarOpen}
            aria-controls="mobile-sidebar"
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-lg p-2 text-[#A1A1AA] transition-colors hover:bg-[#303642] hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </button>

          <span className="text-base font-semibold tracking-tight">
            TaskFlow
          </span>
        </header>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
