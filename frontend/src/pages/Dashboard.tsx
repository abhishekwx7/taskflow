import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, ListTodo, LogOut, CheckCheck } from "lucide-react";

import { useAuth } from "../context/AuthContext";

import { createProject, getProjects } from "../services/project.service";
import { getAllTasks } from "../services/task.service";
import type { Task } from "../types/task";

import type { CreateProjectInput, Project } from "../types/projects";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectName, setProjectName] = useState("");
  const [projectColor, setProjectColor] = useState("");

  const [projectSearch, setProjectSearch] = useState("");
  const [debouncedProjectSearch, setDebouncedProjectSearch] = useState("");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);

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

  // Fetch all tasks once when Dashboard mounts
  useEffect(() => {
    async function fetchTasks() {
      try {
        setError("");

        const data = await getAllTasks();

        setTasks(data.tasks);
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

  const currentHour = new Date().getHours();

  let greeting = "Good evening";

  if (currentHour < 12) {
    greeting = "Good morning";
  } else if (currentHour < 18) {
    greeting = "Good afternoon";
  }

  return (
    <>
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            {greeting}, {user?.name} 👋
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage your projects and stay organized.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-4 lg:px-8">
        {/* Dashboard Stats */}

        <div className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Projects</p>

            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              {projects.length}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Tasks</p>

            <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
              {totalTasks}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Completed</p>

            <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
              {completedTasks}
            </p>
          </div>
        </div>

        {/* PROJECTS */}

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Projects</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your current projects
              </p>
            </div>
          </div>

          <div className="mb-5 space-y-3">
            {" "}
            {/* Search */}
            <input
              type="text"
              value={projectSearch}
              onChange={(e) => {
                setProjectSearch(e.target.value);
              }}
              placeholder="Search projects..."
              className="h-10 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            {/* Create Project */}
            <form
              onSubmit={handleCreateProject}
              className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center"
            >
              <input
                type="text"
                value={projectName}
                onChange={(e) => {
                  setProjectName(e.target.value);
                }}
                placeholder="Project name"
                className="h-10 min-w-0 flex-1 rounded-lg border border-gray-300 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <input
                type="color"
                value={projectColor}
                onChange={(e) => {
                  setProjectColor(e.target.value);
                }}
                className="h-10 w-14 shrink-0 cursor-pointer rounded-lg border border-gray-300"
              />

              <button
                type="submit"
                disabled={isCreating || !projectName.trim()}
                className="h-10 shrink-0 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCreating ? "Creating..." : "Create Project"}
              </button>
            </form>
          </div>

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
                  className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{
                        backgroundColor: project.color || "#6b7280",
                      }}
                    />

                    <h4 className="min-w-0 truncate text-sm font-semibold text-gray-900">
                      {project.name}
                    </h4>
                  </div>

                  <p className="text-xs text-gray-400">
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
