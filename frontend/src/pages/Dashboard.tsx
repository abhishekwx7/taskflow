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
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">Todo App</h1>

            {user && (
              <p className="text-sm text-gray-500">Welcome, {user.name}</p>
            )}
          </div>

          <button
            onClick={logout}
            className="rounded bg-black px-4 py-2 text-sm text-white"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold">Projects</h2>

          <input
            type="text"
            value={projectSearch}
            onChange={(e) => {
              setProjectSearch(e.target.value);
            }}
            placeholder="Search Projects..."
            className="mb-4 rounded-lg w-full border bg-white px-3 py-2"
          />

          <form
            onSubmit={handleCreateProject}
            className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow sm:flex-row"
          >
            <input
              type="text"
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
              }}
              placeholder="Project Name"
              className="flex-1 rounded border px-3 py-2"
            />

            <input
              type="color"
              value={projectColor}
              onChange={(e) => {
                setProjectColor(e.target.value);
              }}
              placeholder="#3b82f6"
              className="rounded border px-3 py-2"
            />

            <button
              type="submit"
              disabled={isCreating || !projectName.trim()}
              className="rounded bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create Project"}
            </button>
          </form>
        </div>

        {error && (
          <p className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {isLoading ? (
          <p className="">Loading Projects...</p>
        ) : projects.length === 0 ? (
          <div>
            <p>No projects yet. Create your first project.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="rounded-lg bg-white p-5 shadow transition hover:shadow:md cursor-pointer"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{
                      backgroundColor: project.color || "#6b7280",
                    }}
                  />

                  <h3 className="font-semibold">{project.name}</h3>
                </div>

                <p className="text-xs text-gray-400">
                  Created
                  {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
