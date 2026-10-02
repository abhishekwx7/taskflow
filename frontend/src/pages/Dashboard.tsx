import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import { createProject, getProjects } from "../services/project.service";

import type { CreateProjectInput, Project } from "../types/projects";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectName, setProjectName] = useState("");
  const [projectColor, setProjectColor] = useState("");

  const [projectSearch, setProjectSearch] = useState("");
  const [debouncedProjectSearch, setDebouncedProjectSearch] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedProjectSearch(projectSearch.trim());
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, [projectSearch]);

  useEffect(() => {
    async function fetchProjects() {
      try {
        setError("");

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

  async function handleCreateProject(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!projectName.trim()) {
      return;
    }

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

      setProjects((prev) => [newProject, ...prev]);

      setProjectName("");
      setProjectColor("");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const messsage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to create project";

        setError(messsage);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="flex w-64 flex-col border-r bg-white">
          {/* Logo */}
          <div className="border-b px-6 py-5">
            <h1 className="text-xl font-bold text-gray-900">TaskFlow</h1>

            {user && (
              <p className="mt-1 text-sm text-gray-500">Welcome, {user.name}</p>
            )}
          </div>
          {/* Navigation */}
          <nav className="flex-1 px-3 py-6">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              WorkSpace
            </p>
            {/* Dashboard */}
            <button
              onClick={() => navigate("/")}
              className="mb-1 flex w-full items-center gap-3 rounded-lg bg-gray-100 px-3 py-2.5 text-sm font-medium text-gray-900"
            >
              <span>▦</span>
              Dashboard
            </button>
            {/* Tasks */}
            <button
              onClick={() => navigate("/tasks")}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            >
              <span>✓</span>
              Tasks
            </button>
          </nav>

          {/* Logout */}
          <div className="border-t p-3">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600"
            >
              <span>↪</span>
              Logout
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1">
          {/* Top Header */}
          <header className="border-b bg-white">
            <div className="px-8 py-5">
              <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

              <p className="mt-1 text-sm text-gray-500">
                {" "}
                Manage your projects and stay organized.
              </p>
            </div>
          </header>

          {/* Page Content */}
          <div className="mx-auto max-w-6xl px-8 py-8">
            {/* PROJECTS */}
            <section>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Projects
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Your current projects
                  </p>
                </div>
              </div>

              {/* Search */}
              <input
                type="text"
                value={projectSearch}
                onChange={(e) => {
                  setProjectSearch(e.target.value);
                }}
                placeholder="Search projects..."
                className="mb-4 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              {/* Create Project */}
              <form
                onSubmit={handleCreateProject}
                className="mb-8 flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm sm:flex-row"
              >
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => {
                    setProjectName(e.target.value);
                  }}
                  placeholder="Project name"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <input
                  type="color"
                  value={projectColor}
                  onChange={(e) => {
                    setProjectColor(e.target.value);
                  }}
                  className="h-10 w-16 cursor-pointer rounded-lg border border-gray-300"
                />

                <button
                  type="submit"
                  disabled={isCreating || !projectName.trim()}
                  className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCreating ? "Creating..." : "Create Project"}
                </button>
              </form>

              {/* Error */}
              {error && (
                <p className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              {/* Projects */}
              {isLoading ? (
                <p className="text-sm text-gray-500">Loading projects...</p>
              ) : projects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
                  <p className="font-medium text-gray-700">No projects yet</p>

                  <p className="mt-1 text-sm text-gray-500">
                    Create your first project above.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="cursor-pointer rounded-xl border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="mb-4 flex items-center gap-3">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{
                            backgroundColor: project.color || "#6b7280",
                          }}
                        />

                        <h4 className="font-semibold text-gray-900">
                          {project.name}
                        </h4>
                      </div>

                      <p className="text-xs text-gray-400">
                        Created{" "}
                        {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
