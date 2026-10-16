import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCheck,
  CircleCheck,
  FolderKanban,
  ListFilter,
  Search,
  Tags,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

type DemoTask = {
  id: number;
  title: string;
  tag: string;
  done: boolean;
};

const INITIAL_TASKS: DemoTask[] = [
  { id: 1, title: "Learn full stack", tag: "Learning", done: false },
  { id: 2, title: "Ship the first version", tag: "Development", done: true },
  { id: 3, title: "Complete assignments", tag: "Study", done: false },
  { id: 4, title: "Deploy TaskFlow", tag: "Development", done: false },
];

const FEATURES = [
  {
    icon: FolderKanban,
    title: "Organize with projects",
    description:
      "Keep related tasks together in dedicated projects with custom colors.",
  },
  {
    icon: Tags,
    title: "Labels and due dates",
    description:
      "Categorize your tasks, set deadlines, and stay on top of your work.",
  },
  {
    icon: ListFilter,
    title: "Find what matters",
    description:
      "Search, filter, and sort tasks without losing track of anything.",
  },
];

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#F4F5F8] px-5 py-3 text-sm font-semibold text-[#0F1117] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#303542] px-5 py-3 text-sm font-medium text-[#C1C5D0] transition-colors hover:border-[#505769] hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500";

export default function Landing() {
  const [tasks, setTasks] = useState<DemoTask[]>(INITIAL_TASKS);
  const { isAuthenticated } = useAuth();

  const destination = isAuthenticated ? "/dashboard" : "/signup";

  const completed = tasks.filter((task) => task.done).length;
  const progress = Math.round((completed / tasks.length) * 100);

  function toggleTask(id: number) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0F1117] text-[#F4F5F8] antialiased">
      {/* Navigation */}
      <nav className="border-b border-[#252936]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#252B3A]">
              <CheckCheck size={20} className="text-[#F4F5F8]" />
            </span>
            <span className="text-xl font-bold tracking-tight">TaskFlow</span>
          </Link>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard" className={primaryButton}>
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Open app</span>
                <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="rounded-lg px-2 py-2 text-sm text-[#A1A8BA] transition-colors hover:text-white"
                >
                  Sign in
                </Link>
                <Link to="/signup" className={primaryButton}>
                  Get started
                  <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-5 pb-24 pt-20 sm:px-8 sm:pt-28 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:pb-32 lg:pt-36">
          <div className="relative z-10">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#30394C] bg-[#192235] px-3.5 py-1.5 text-xs font-medium text-[#9BBEFF]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#74A5FF]" />A
              simpler way to stay organized
            </div>

            <h1 className="max-w-[580px] text-[clamp(43px,5.2vw,76px)] font-bold leading-[1.07] tracking-[-0.055em]">
              Less chaos.
              <br />
              <span className="text-[#A7BFFF]">More progress.</span>
            </h1>

            <p className="mt-7 max-w-[480px] text-base leading-8 text-[#9CA3B5] sm:text-lg">
              Bring your projects, tasks, and deadlines into one organized
              workspace. Stay focused on what matters and make progress every
              day.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to={destination} className={primaryButton}>
                {isAuthenticated ? "Open dashboard" : "Get started"}
                <ArrowRight size={17} />
              </Link>

              <a href="#features" className={secondaryButton}>
                Explore features
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#858DA0]">
              <span className="flex items-center gap-2">
                <CircleCheck size={15} className="text-[#65C89B]" />
                Simple by design
              </span>
              <span className="flex items-center gap-2">
                <CircleCheck size={15} className="text-[#65C89B]" />
                Everything in one place
              </span>
            </div>
          </div>

          {/* Interactive Product Preview */}
          <div className="relative min-w-0">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-6 rounded-[40px] bg-blue-500/10 blur-3xl"
            />

            <div className="relative overflow-hidden rounded-2xl border border-[#323849] bg-[#191D27] shadow-2xl shadow-black/30">
              {/* Preview Header */}
              <div className="flex items-center justify-between border-b border-[#303543] px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2C3445]">
                    <FolderKanban size={17} className="text-[#A7BFFF]" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">My Workspace</p>
                    <p className="text-xs text-[#858DA0]">Personal projects</p>
                  </div>
                </div>

                <span className="rounded-lg border border-[#33394A] px-2.5 py-1 text-xs text-[#9CA3B5]">
                  Demo
                </span>
              </div>

              {/* Project Content */}
              <div className="p-4 sm:p-6">
                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold">Project tasks</h2>
                    <span className="text-xs text-[#9CA3B5]">
                      {completed} of {tasks.length} done
                    </span>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-[#303543]">
                    <div
                      className="h-full rounded-full bg-[#729EFF] transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Mock Search */}
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#303543] bg-[#141821] px-3 py-2.5 text-sm text-[#767F92]">
                  <Search size={16} />
                  <span>Manage your tasks</span>
                </div>

                {/* Tasks */}
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      aria-pressed={task.done}
                      onClick={() => toggleTask(task.id)}
                      className="flex w-full items-center gap-3 rounded-xl border border-[#2B3040] bg-[#202530] px-3 py-3.5 text-left transition-colors hover:border-[#46516A] hover:bg-[#262D3B] focus-visible:outline-2 focus-visible:outline-blue-500 sm:px-4"
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                          task.done
                            ? "border-[#2FC981] bg-[#2FC981]"
                            : "border-[#717A8E]"
                        }`}
                      >
                        {task.done && (
                          <Check
                            size={13}
                            strokeWidth={3}
                            className="text-white"
                          />
                        )}
                      </span>

                      <span
                        className={`min-w-0 flex-1 break-words text-sm ${
                          task.done
                            ? "text-[#858DA0] line-through"
                            : "text-[#E9ECF3]"
                        }`}
                      >
                        {task.title}
                      </span>

                      <span className="hidden shrink-0 rounded-full bg-blue-500/15 px-2.5 py-1 text-[11px] text-[#85ACFF] sm:inline-flex">
                        {task.tag}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#303543] pt-4">
                  <span className="text-xs text-[#858DA0]">
                    Try completing a task
                  </span>
                  <span className="text-xs font-medium text-[#A7BFFF]">
                    {progress}% complete
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="border-y border-[#252936] bg-[#12151D]"
        >
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
            <div className="max-w-2xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#8EACFA]">
                Built for focus
              </p>

              <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Everything you need.
                <br />
                Nothing you don't.
              </h2>

              <p className="mt-5 max-w-lg text-base leading-7 text-[#9CA3B5]">
                Practical tools to organize your work without making task
                management another task.
              </p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="rounded-2xl border border-[#2B3040] bg-[#1A1E29] p-6 transition-colors hover:border-[#47516A] sm:p-7"
                  >
                    <div className="mb-7 flex h-11 w-11 items-center justify-center rounded-xl bg-[#29354D]">
                      <Icon size={21} className="text-[#9BBEFF]" />
                    </div>

                    <h3 className="text-lg font-semibold tracking-tight">
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-[#9CA3B5]">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Additional capabilities */}
            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-[#9CA3B5]">
              <span className="flex items-center gap-2">
                <CalendarDays size={16} className="text-[#8EACFA]" />
                Due dates
              </span>
              <span className="flex items-center gap-2">
                <Search size={16} className="text-[#8EACFA]" />
                Task search
              </span>
              <span className="flex items-center gap-2">
                <CheckCheck size={16} className="text-[#8EACFA]" />
                Progress tracking
              </span>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-6xl px-5 py-24 text-center sm:px-8 sm:py-32">
          <div className="mx-auto max-w-2xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#8EACFA]">
              Your next step
            </p>

            <h2 className="text-[clamp(36px,5vw,64px)] font-bold leading-[1.1] tracking-[-0.045em]">
              Make room for
              <br />
              what matters.
            </h2>

            <p className="mx-auto mt-6 max-w-md text-base leading-7 text-[#9CA3B5]">
              Spend less time managing tasks and more time making meaningful
              progress.
            </p>

            <Link to={destination} className={`${primaryButton} mt-9`}>
              {isAuthenticated ? "Go to dashboard" : "Start organizing"}
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#252936]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-center sm:flex-row sm:px-8 sm:text-left">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#C5CAD5]">
            <CheckCheck size={17} />
            TaskFlow
          </div>

          <p className="text-xs text-[#858DA0]">
            Simple tools. Better focus. More progress.
          </p>
        </div>
      </footer>
    </div>
  );
}
