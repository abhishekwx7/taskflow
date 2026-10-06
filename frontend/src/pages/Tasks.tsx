import { useEffect, useState } from "react";
import {
  getAllTasks,
  updateTask,
  deleteTask,
  type TaskSort,
} from "../services/task.service";
import { getLabels } from "../services/label.service";
import type { Task } from "../types/task";
import type { Label } from "../types/label";
import axios from "axios";

interface TaskStats {
  completed: number;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [status, setStatus] = useState<"all" | "pending" | "completed">("all");

  const [sort, setSort] = useState<TaskSort>("newest");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [editTaskName, setEditTaskName] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [stats, setStats] = useState<TaskStats>({
    completed: 0,
  });

  const [labels, setLabels] = useState<Label[]>([]);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, sort]);

  useEffect(() => {
    async function fetchTasks() {
      try {
        setError("");
        setIsLoading(true);

        const data = await getAllTasks({
          page,
          limit: 10,
          search: debouncedSearch || undefined,
          status,
          sort,
          labels:
            selectedLabelIds.length > 0
              ? selectedLabelIds.join(",")
              : undefined,
        });

        setTasks(data.tasks);
        setPagination(data.pagination);
        setStats(data.stats);
      } catch (error) {
        setError("Failed to fetch tasks!");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTasks();
  }, [page, debouncedSearch, status, sort, selectedLabelIds]);

  useEffect(() => {
    async function fetchLabels() {
      try {
        const data = await getLabels();
        setLabels(data);
      } catch (error) {
        console.error(error);
      }
    }

    fetchLabels();
  }, []);

  function toggleLabel(labelId: string) {
    setSelectedLabelIds((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId],
    );

    setPage(1);
  }

  async function handleToggleTask(task: Task) {
    try {
      setError("");

      const updatedTask = await updateTask(task.id, {
        isCompleted: !task.isCompleted,
      });

      setTasks((prev) =>
        prev.map((item) => (item.id === updatedTask.id ? updatedTask : item)),
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update task";

        setError(message);
      } else {
        setError("Something went wrong!");
      }
    }
  }

  async function handleDeleteTask() {
    if (!taskToDelete) {
      return;
    }

    try {
      setError("");
      setIsDeleting(true);

      await deleteTask(taskToDelete.id);

      setTasks((prev) => prev.filter((task) => task.id !== taskToDelete.id));

      setTaskToDelete(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to delete task";

        setError(message);
      } else {
        setError("Something went wrong!");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  function openEditDialog(task: Task) {
    setTaskToEdit(task);
    setEditTaskName(task.name);

    if (task.dueDate) {
      setEditDueDate(task.dueDate.slice(0, 10));
    } else {
      setEditDueDate("");
    }
  }

  async function handleEditTask(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!taskToEdit || !editTaskName.trim()) {
      return;
    }

    try {
      setError("");
      setIsUpdating(true);

      const updatedTask = await updateTask(taskToEdit.id, {
        name: editTaskName.trim(),
        ...(editDueDate && {
          dueDate: new Date(editDueDate).toISOString(),
        }),
      });

      setTasks((prev) =>
        prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
      );

      setTaskToEdit(null);
      setEditTaskName("");
      setEditDueDate("");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update task";

        setError(message);
      } else {
        setError("Something went wrong!");
      }
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-10">
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-10">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>

      <p className="mt-2 text-gray-500">All tasks across your projects</p>

      {error && (
        <p className="mt-4 rounded bg-red-100 p-3 text-red-700">{error}</p>
      )}

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-64 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
          />

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "all" | "pending" | "completed")
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition hover:bg-gray-50 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
          >
            <option value="all">All tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as TaskSort)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition hover:bg-gray-50 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="dueDateAsc">Due date: earliest</option>
            <option value="dueDateDesc">Due date: latest</option>
            <option value="nameAsc">Name A - Z</option>
            <option value="nameDesc">Name Z - A</option>
          </select>
        </div>

        {labels.length > 0 && (
          <div className="mt-5 border-t border-gray-200 pt-4">
            <p className="mb-3 text-sm font-medium text-gray-500">
              Filter by label
            </p>

            <div className="flex flex-wrap gap-2">
              {labels.map((label) => {
                const isSelected = selectedLabelIds.includes(label.id);

                return (
                  <button
                    key={label.id}
                    type="button"
                    onClick={() => toggleLabel(label.id)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      isSelected
                        ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    {label.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="rounded-lg border bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={task.isCompleted}
                  onChange={() => handleToggleTask(task)}
                  className="mt-1 h-4 w-4"
                />

                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      task.isCompleted
                        ? "text-gray-400 line-through"
                        : "text-gray-900"
                    }`}
                  >
                    {task.name}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor: task.project.color ?? "#94a3b8",
                        }}
                      />

                      <span>{task.project.name}</span>
                    </div>

                    {task.labels.map((label) => (
                      <span
                        key={label.id}
                        className="rounded-full px-2 py-1 text-xs text-white"
                        style={{
                          backgroundColor: label.color ?? "#6b7280",
                        }}
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>

                  {task.dueDate && (
                    <p className="mt-2 text-sm text-gray-500">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openEditDialog(task)}
                  className="rounded bg-blue-500 px-3 py-1 text-sm text-white"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => setTaskToDelete(task)}
                  className="rounded bg-red-500 px-3 py-1 text-sm text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setPage((prev) => prev - 1)}
            disabled={page == 1}
            className="rounded border bg-white px-4 py-2 text-sm 
            disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={page === pagination.totalPages}
            className="rounded border bg-white px-4 py-2 text-sm 
            disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {taskToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold">Delete task?</h2>

            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete "{taskToDelete.name}"?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                disabled={isDeleting}
                className="rounded border px-4 py-2"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteTask}
                disabled={isDeleting}
                className="rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {taskToEdit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <form
            onSubmit={handleEditTask}
            className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg"
          >
            <h2 className="text-lg font-semibold">Edit Task</h2>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium">
                Task name
              </label>

              <input
                type="text"
                value={editTaskName}
                onChange={(e) => setEditTaskName(e.target.value)}
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium">Due Date</label>

              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setTaskToEdit(null)}
                disabled={isUpdating}
                className="rounded border px-4 py-2"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isUpdating || !editTaskName.trim()}
                className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
              >
                {isUpdating ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
