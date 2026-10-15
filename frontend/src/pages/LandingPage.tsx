import { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

type DemoTask = { id: number; title: string; tag: string; done: boolean };

const INITIAL_TASKS: DemoTask[] = [
  { id: 1, title: "Learn full stack", tag: "learn", done: false },
  { id: 2, title: "Ship the first version", tag: "build", done: true },
  { id: 3, title: "Complete assignments", tag: "study", done: false },
];

const FEATURES = [
  {
    title: "Projects",
    text: "Give each project its own color and keep its tasks together.",
  },
  {
    title: "Labels and due dates",
    text: "Tag tasks, set a date and see what needs you first.",
  },
  {
    title: "Search, filter, sort",
    text: "Find any task in seconds, pending or completed.",
  },
];

const btn =
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-[#f4f5f8] px-3 py-2.5 text-sm font-medium text-[#0f1117] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500 sm:px-[22px] sm:py-3 sm:text-base";

const btnLg =
  "rounded-[14px] px-6 py-3.5 text-base sm:px-8 sm:py-[18px] sm:text-lg";

const ghost =
  "inline-flex items-center justify-center whitespace-nowrap rounded-[10px] px-2 py-2.5 text-sm text-[#8b90a3] transition hover:text-[#f4f5f8] focus-visible:outline-2 focus-visible:outline-blue-500 sm:px-3.5 sm:text-base";

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="#fff"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 8.5l3.2 3L13 4.5" />
    </svg>
  );
}

export default function Landing() {
  const [tasks, setTasks] = useState<DemoTask[]>(INITIAL_TASKS);

  const { isAuthenticated } = useAuth();

  const toggle = (id: number) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );

  return (
    <div
      className="min-h-screen bg-[#0f1117] text-[#f4f5f8] antialiased"
      style={{
        fontFamily:
          '"Bricolage Grotesque", system-ui, -apple-system, "Segoe UI", sans-serif',
      }}
    >
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8">
        {/* Nav */}
        <nav className="flex items-center justify-between gap-5 py-5 sm:py-7">
          <Link
            to="/"
            className="shrink-0 text-xl font-bold tracking-tight sm:text-[22px]"
          >
            TaskFlow
          </Link>
          <div className="flex items-center gap-1 sm:gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard" className={btn}>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/signin" className={ghost}>
                  Sign in
                </Link>

                <Link to="/signup" className={btn}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Hero */}

        <header className="pb-12 pt-16 sm:pb-16 sm:pt-20 lg:pb-20 lg:pt-28">
          <h1 className="max-w-[11ch] text-[clamp(40px,8vw,112px)] font-bold leading-[1.02] tracking-[-0.04em] sm:leading-[0.98]">
            Get your tasks in order.
          </h1>

          <p className="mb-8 mt-5 max-w-[34ch] text-lg leading-relaxed text-[#8b90a3] sm:mb-10 sm:mt-8 sm:text-xl lg:text-[26px] lg:leading-snug">
            Projects, labels and due dates in one calm place.
          </p>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            {isAuthenticated ? (
              <Link to="/dashboard" className={`${btn} ${btnLg} text-center`}>
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link to="/signup" className={`${btn} ${btnLg} text-center`}>
                  Start for free
                </Link>

                <Link to="/signin" className={`${ghost} text-center`}>
                  I have an account
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Interactive demo */}
        <div
          aria-label="Try checking off a task"
          className="mb-20 mt-4 w-full max-w-[720px] rounded-2xl border border-[#262a37] bg-[#1a1d27] p-2 sm:mb-28 sm:mt-6 sm:p-3 lg:mb-[120px]"
        >
          {tasks.map((t, i) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={t.done}
              onClick={() => toggle(t.id)}
              className={`flex w-full items-center gap-3 px-2 py-4 text-left text-base transition hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-blue-500 sm:gap-4 sm:px-4 sm:py-[18px] sm:text-xl lg:text-2xl ${
                i === 0
                  ? "rounded-xl"
                  : "rounded-none border-t border-[#262a37]"
              }`}
            >
              <span
                className={`grid h-7 w-7 flex-none place-items-center rounded-lg border-2 transition ${
                  t.done ? "border-green-500 bg-green-500" : "border-[#8b90a3]"
                }`}
              >
                <span
                  className={`transition-opacity ${t.done ? "opacity-100" : "opacity-0"}`}
                >
                  <CheckIcon />
                </span>
              </span>

              <span
                className={`min-w-0 flex-1 break-words ${
                  t.done ? "text-[#8b90a3] line-through" : ""
                }`}
              >
                {t.title}
              </span>

              <span className="ml-auto hidden rounded-full bg-blue-500/15 px-3 py-1 text-sm text-blue-500 sm:inline">
                {t.tag}
              </span>
            </button>
          ))}
        </div>

        {/* Features */}
        <section className="border-t border-[#262a37]">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="grid gap-3 border-b border-[#262a37] py-8 sm:gap-5 sm:py-10 md:grid-cols-2 md:items-baseline md:gap-6 lg:py-12"
            >
              <h2 className="text-[clamp(32px,5vw,56px)] font-bold leading-[1.05] tracking-[-0.03em]">
                {f.title}
              </h2>
              <p className="max-w-[34ch] text-[clamp(18px,2vw,22px)] text-[#8b90a3]">
                {f.text}
              </p>
            </div>
          ))}
        </section>

        {/* Final CTA */}

        <section className="py-20 text-center sm:py-28 lg:py-40">
          <h2 className="mb-8 text-[clamp(36px,7vw,96px)] font-bold leading-[1.05] tracking-[-0.04em] sm:mb-10 sm:leading-none">
            {isAuthenticated
              ? "Ready to get things done?"
              : "Start organizing today."}
          </h2>

          <Link
            to={isAuthenticated ? "/dashboard" : "/signup"}
            className={`${btn} ${btnLg}`}
          >
            {isAuthenticated ? "Go to Dashboard" : "Create your account"}
          </Link>
        </section>

        {/* Footer */}

        <footer className="flex flex-col items-center gap-2 border-t border-[#262a37] py-8 text-center text-sm text-[#8b90a3] sm:flex-row sm:justify-between sm:gap-4 sm:py-10 sm:text-left">
          <span>TaskFlow</span>
          <span>Project management, kept simple.</span>
        </footer>
      </div>
    </div>
  );
}
