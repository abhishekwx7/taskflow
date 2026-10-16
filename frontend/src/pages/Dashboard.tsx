import axios from "axios";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCheck,
  FolderKanban,
  ListTodo,
  Plus,
  Search,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { createProject, getProjects } from "../services/project.service";
import { getAllTasks } from "../services/task.service";

import type { CreateProjectInput, Project } from "../types/projects";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectName, setProjectName] = useState("");
  const [projectColor, setProjectColor] = useState("");

  const [projectSearch, setProjectSearch] = useState("");
  const [debouncedProjectSearch, setDebouncedProjectSearch] = useState("");

  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const [currentTime, setCurrentTime] = useState(new Date());

  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Current date and time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formattedTime = currentTime.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedDate = currentTime.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const currentHour = currentTime.getHours();

  let greeting = "Good evening";

  if (currentHour < 12) {
    greeting = "Good morning";
  } else if (currentHour < 18) {
    greeting = "Good afternoon";
  }

  // Debounced project search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedProjectSearch(projectSearch.trim());
    }, 1500);

    return () => clearTimeout(timer);
  }, [projectSearch]);

  // Fetch projects
  useEffect(() => {
    async function fetchProjects() {
      try {
        setError("");
        setIsLoading(true);

        const data = await getProjects({
          search: debouncedProjectSearch,
        });

        setProjects(data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message =
            error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to fetch projects";

          setError(message);
        } else {
          setError("Something went wrong");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjects();
  }, [debouncedProjectSearch]);

  // Fetch task statistics
  useEffect(() => {
    async function fetchTasks() {
      try {
        const data = await getAllTasks();

        setTotalTasks(data.pagination.total);
        setCompletedTasks(data.stats.completed);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message =
            error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to fetch tasks";

          setError(message);
        } else {
          setError("Something went wrong");
        }
      }
    }

    fetchTasks();
  }, []);

  // Create project
  async function handleCreateProject(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!projectName.trim()) return;

    setError("");
    setIsCreating(true);

    try {
      const data: CreateProjectInput = {
        name: projectName.trim(),
      };

      if (projectColor) {
        data.color = projectColor;
      }

      const newProject = await createProject(data);

      setProjects((prev) => {
        if (
          debouncedProjectSearch &&
          !newProject.name
            .toLowerCase()
            .includes(debouncedProjectSearch.toLowerCase())
        ) {
          return prev;
        }

        return [newProject, ...prev];
      });

      setProjectName("");
      setProjectColor("");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to create project";

        setError(message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0F1117] text-[#F4F5F8] antialiased">
      {/* Dashboard Header */}
      <header className="border-b border-[#252936] bg-[#12151D]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-8">
          {/* Greeting */}
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#30394C] bg-[#192235] px-3 py-1 text-xs font-medium text-[#9BBEFF]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#74A5FF]" />
              Your workspace
            </div>

            <h1 className="break-words text-2xl font-bold tracking-tight text-[#F4F5F8] sm:text-3xl">
              {greeting}, <span className="text-[#A7BFFF]">{user?.name}</span>{" "}
              👋
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#9CA3B5]">
              Manage your projects and stay organized.
            </p>
          </div>

          {/* Date and Time */}
          <div className="shrink-0 text-left sm:text-right">
            <p className="text-sm font-semibold text-[#F4F5F8] sm:text-base">
              {formattedTime}
            </p>

            <p className="mt-1 text-xs text-[#858DA0] sm:text-sm">
              {formattedDate}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        {/* Statistics */}
        <section className="mb-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Projects Stat */}
            <div className="rounded-2xl border border-[#2B3040] bg-[#1A1E29] p-5 transition-colors hover:border-[#47516A] sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm font-medium text-[#9CA3B5]">Projects</p>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#29354D]">
                  <FolderKanban size={19} className="text-[#9BBEFF]" />
                </div>
              </div>

              <p className="text-3xl font-bold tracking-tight text-[#F4F5F8]">
                {projects.length}
              </p>

              <p className="mt-2 text-xs text-[#858DA0]">
                {debouncedProjectSearch
                  ? "Matching projects"
                  : "Projects in your workspace"}
              </p>
            </div>

            {/* Total Tasks Stat */}
            <div className="rounded-2xl border border-[#2B3040] bg-[#1A1E29] p-5 transition-colors hover:border-[#47516A] sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm font-medium text-[#9CA3B5]">
                  Total Tasks
                </p>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#29354D]">
                  <ListTodo size={19} className="text-[#9BBEFF]" />
                </div>
              </div>

              <p className="text-3xl font-bold tracking-tight text-[#F4F5F8]">
                {totalTasks}
              </p>

              <p className="mt-2 text-xs text-[#858DA0]">
                Tasks across all projects
              </p>
            </div>

            {/* Completed Stat */}
            <div className="rounded-2xl border border-[#2B3040] bg-[#1A1E29] p-5 transition-colors hover:border-[#47516A] sm:col-span-2 sm:p-6 lg:col-span-1">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm font-medium text-[#9CA3B5]">Completed</p>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#29354D]">
                  <CheckCheck size={19} className="text-[#9BBEFF]" />
                </div>
              </div>

              <div className="flex items-end justify-between gap-3">
                <p className="text-3xl font-bold tracking-tight text-[#F4F5F8]">
                  {completedTasks}
                </p>

                <span className="text-sm font-semibold text-[#A7BFFF]">
                  {completionPercentage}%
                </span>
              </div>

              <div
                className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#303543]"
                role="progressbar"
                aria-label="Task completion"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={completionPercentage}
              >
                <div
                  className="h-full rounded-full bg-[#729EFF] transition-all duration-300"
                  style={{
                    width: `${completionPercentage}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Projects */}
        <section>
          {/* Section Heading */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8EACFA]">
                Your workspace
              </p>

              <h2 className="text-2xl font-bold tracking-tight text-[#F4F5F8]">
                Projects
              </h2>

              <p className="mt-2 text-sm text-[#9CA3B5]">
                Keep your work organized, one project at a time.
              </p>
            </div>
          </div>

          {/* Search and Create */}
          <div className="mb-6 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search
                size={18}
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#858DA0]"
              />

              <input
                type="search"
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                placeholder="Search projects..."
                aria-label="Search projects"
                className="h-12 w-full rounded-xl border border-[#303543] bg-[#1A1E29] py-3 pl-11 pr-4 text-base text-[#F4F5F8] outline-none transition-colors placeholder:text-[#858DA0] focus:border-[#729EFF] focus:ring-2 focus:ring-blue-500/15 sm:text-sm"
              />
            </div>

            {/* Create Project Form */}
            <form
              onSubmit={handleCreateProject}
              className="flex flex-col gap-3 rounded-2xl border border-[#2B3040] bg-[#1A1E29] p-4 sm:flex-row sm:items-center"
            >
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name..."
                aria-label="Project name"
                className="h-11 min-w-0 flex-1 rounded-lg border border-[#303543] bg-[#141821] px-4 text-base text-[#F4F5F8] outline-none transition-colors placeholder:text-[#858DA0] focus:border-[#729EFF] focus:ring-2 focus:ring-blue-500/15 sm:text-sm"
              />

              <div className="flex items-center gap-3">
                {/* Project Color */}
                <label
                  className="flex h-11 w-14 shrink-0 items-center justify-center rounded-lg border border-[#303543] bg-[#141821] p-1"
                  title="Choose project color"
                >
                  <span className="sr-only">Project color</span>

                  <input
                    type="color"
                    value={projectColor || "#729EFF"}
                    onChange={(e) => setProjectColor(e.target.value)}
                    aria-label="Project color"
                    className="h-full w-full cursor-pointer rounded-md border-0 bg-transparent"
                  />
                </label>

                {/* Create Button */}
                <button
                  type="submit"
                  disabled={isCreating || !projectName.trim()}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#F4F5F8] px-5 text-sm font-semibold text-[#0F1117] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                >
                  {isCreating ? (
                    "Creating..."
                  ) : (
                    <>
                      <Plus size={17} />
                      Create Project
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400"
            >
              {error}
            </div>
          )}

          {/* Project List */}
          {isLoading ? (
            <div className="flex items-center justify-center gap-3 py-12">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#303543] border-t-[#729EFF]" />

              <p className="text-sm font-medium text-[#9CA3B5]">
                Loading projects...
              </p>
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#303543] bg-[#1A1E29] px-5 py-12 text-center">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#29354D]">
                <FolderKanban size={23} className="text-[#9BBEFF]" />
              </div>

              <h3 className="text-lg font-semibold text-[#F4F5F8]">
                {debouncedProjectSearch
                  ? "No matching projects"
                  : "No projects yet"}
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#9CA3B5]">
                {debouncedProjectSearch
                  ? "Try searching with a different project name."
                  : "Create your first project above and start organizing your tasks."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="group w-full rounded-2xl border border-[#2B3040] bg-[#1A1E29] p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#47516A] hover:bg-[#202530] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {/* Project Color */}
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{
                          backgroundColor: project.color || "#729EFF",
                        }}
                      />

                      <h3 className="truncate text-sm font-semibold text-[#F4F5F8]">
                        {project.name}
                      </h3>
                    </div>

                    <ArrowRight
                      size={17}
                      aria-hidden="true"
                      className="shrink-0 text-[#858DA0] transition-all duration-200 group-hover:translate-x-1 group-hover:text-[#A7BFFF]"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-[#303543] pt-3">
                    <p className="text-xs text-[#858DA0]">
                      Created {new Date(project.createdAt).toLocaleDateString()}
                    </p>

                    <span className="text-xs font-medium text-[#9BBEFF]">
                      View project
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
