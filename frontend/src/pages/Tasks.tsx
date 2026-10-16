import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import {
  CalendarDays,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  Search,
} from "lucide-react";
import {
  getAllTasks,
  updateTask,
  deleteTask,
  type TaskSort,
} from "../services/task.service";
import { getLabels } from "../services/label.service";
import type { Task } from "../types/task";
import type { Label } from "../types/label";

interface TaskStats {
  completed: number;
}
type Status = "all" | "pending" | "completed";

const inputClass =
  "h-11 w-full rounded-xl border border-[#303543] bg-[#141821] px-4 text-sm text-[#F4F5F8] placeholder:text-[#858DA0] outline-none transition-colors focus:border-[#729EFF] focus:ring-2 focus:ring-blue-500/15";
const subtleButton =
  "rounded-xl border border-[#303543] bg-[#141821] px-4 py-2.5 text-sm font-medium text-[#F4F5F8] transition-colors hover:border-[#47516A] hover:bg-[#202530] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-40";
const primaryButton =
  "rounded-xl bg-[#F4F5F8] px-5 py-2.5 text-sm font-semibold text-[#0F1117] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50";

function contrastText(hex?: string | null) {
  if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return "#FFFFFF";
  const components = [1, 3, 5].map(
    (i) => parseInt(hex.slice(i, i + 2), 16) / 255,
  );
  const luminance = components.map((c) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return luminance[0] * 0.2126 + luminance[1] * 0.7152 + luminance[2] * 0.0722 >
    0.179
    ? "#111827"
    : "#FFFFFF";
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
  const [status, setStatus] = useState<Status>("all");
  const [sort, setSort] = useState<TaskSort>("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [editTaskName, setEditTaskName] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [stats, setStats] = useState<TaskStats>({ completed: 0 });
  const [labels, setLabels] = useState<Label[]>([]);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 1500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, sort, selectedLabelIds]);

  useEffect(() => {
    let active = true;
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
          labels: selectedLabelIds.length
            ? selectedLabelIds.join(",")
            : undefined,
        });
        if (!active) return;
        setTasks(data.tasks);
        setPagination(data.pagination);
        setStats(data.stats);
      } catch {
        if (active) setError("Failed to fetch tasks. Please try again.");
      } finally {
        if (active) setIsLoading(false);
      }
    }
    fetchTasks();
    return () => {
      active = false;
    };
  }, [page, debouncedSearch, status, sort, selectedLabelIds, refreshKey]);

  useEffect(() => {
    getLabels()
      .then(setLabels)
      .catch((err) => console.error("Failed to fetch labels", err));
  }, []);

  function toggleLabel(labelId: string) {
    setSelectedLabelIds((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId],
    );
  }

  function getErrorMessage(err: unknown, fallback: string) {
    if (axios.isAxiosError(err))
      return (
        err.response?.data?.message || err.response?.data?.error || fallback
      );
    return fallback;
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
      setStats((prev) => ({
        ...prev,
        completed: Math.max(
          0,
          prev.completed + (updatedTask.isCompleted ? 1 : -1),
        ),
      }));
      // Re-fetch to respect server filters, ordering, and pagination.
      setRefreshKey((key) => key + 1);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update task"));
    }
  }

  async function handleDeleteTask() {
    if (!taskToDelete) return;
    try {
      setError("");
      setIsDeleting(true);
      await deleteTask(taskToDelete.id);
      setTaskToDelete(null);
      if (tasks.length === 1 && page > 1) setPage((prev) => prev - 1);
      else setRefreshKey((key) => key + 1);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete task"));
    } finally {
      setIsDeleting(false);
    }
  }

  function openEditDialog(task: Task) {
    setTaskToEdit(task);
    setEditTaskName(task.name);
    setEditDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
  }

  async function handleEditTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!taskToEdit || !editTaskName.trim()) return;
    try {
      setError("");
      setIsUpdating(true);
      await updateTask(taskToEdit.id, {
        name: editTaskName.trim(),
        ...(editDueDate
          ? { dueDate: new Date(editDueDate).toISOString() }
          : {}),
      });
      setTaskToEdit(null);
      setEditTaskName("");
      setEditDueDate("");
      setRefreshKey((key) => key + 1);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update task"));
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="min-h-screen min-w-0 bg-[#0F1117] text-[#F4F5F8] antialiased">
      <header className="border-b border-[#252936] bg-[#12151D]">
        <div className="mx-auto w-full max-w-6xl px-5 py-7 sm:px-8 sm:py-9">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#30394C] bg-[#192235] px-3 py-1.5 text-xs font-medium text-[#9BBEFF]">
            <ListTodo size={13} /> Your workspace
          </span>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            All <span className="text-[#A7BFFF]">Tasks</span>
          </h1>
          <p className="mt-2 text-sm text-[#9CA3B5]">
            Manage tasks across all your projects.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Task overview
            </h2>
            <p className="mt-1 text-sm text-[#9CA3B5]">
              Find, organize, and complete your work.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[#2B3040] bg-[#1A1E29] px-3 py-2 text-xs text-[#9CA3B5]">
            <CheckCheck size={16} className="text-[#A7BFFF]" />
            <span>
              {stats.completed} completed · {pagination.total} total
            </span>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400"
          >
            {error}
          </div>
        )}

        <section
          aria-label="Task filters"
          className="rounded-2xl border border-[#2B3040] bg-[#1A1E29] p-4 sm:p-5"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_160px_205px]">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search
                size={17}
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#858DA0]"
              />
              <input
                type="search"
                aria-label="Search tasks"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks..."
                className={`${inputClass} pl-11`}
              />
            </div>
            <div className="relative">
              <select
                aria-label="Filter tasks by status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className={`${inputClass} cursor-pointer appearance-none pr-10`}
              >
                <option value="all">All tasks</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
              <ChevronDown
                size={16}
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3B5]"
              />
            </div>
            <div className="relative">
              <select
                aria-label="Sort tasks"
                value={sort}
                onChange={(e) => setSort(e.target.value as TaskSort)}
                className={`${inputClass} cursor-pointer appearance-none pr-10`}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="dueDateAsc">Due date: earliest</option>
                <option value="dueDateDesc">Due date: latest</option>
                <option value="nameAsc">Name A - Z</option>
                <option value="nameDesc">Name Z - A</option>
              </select>
              <ChevronDown
                size={16}
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3B5]"
              />
            </div>
          </div>
          {labels.length > 0 && (
            <div className="mt-5 border-t border-[#303543] pt-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#9CA3B5]">
                Filter by label
              </p>
              <div className="flex flex-wrap gap-2">
                {labels.map((label) => {
                  const selected = selectedLabelIds.includes(label.id);
                  return (
                    <button
                      key={label.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleLabel(label.id)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${selected ? "border-[#729EFF] bg-[#29354D] text-[#A7BFFF]" : "border-[#303543] bg-[#141821] text-[#9CA3B5] hover:border-[#47516A] hover:text-[#F4F5F8]"}`}
                    >
                      {label.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <section aria-label="Tasks list" className="mt-5 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-[#2B3040] bg-[#1A1E29] py-12">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#303543] border-t-[#729EFF]" />
              <p className="text-sm text-[#9CA3B5]">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#303543] bg-[#1A1E29] px-5 py-12 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#29354D]">
                <ListTodo className="text-[#A7BFFF]" size={22} />
              </div>
              <h3 className="font-semibold">No tasks found</h3>
              <p className="mt-2 text-sm text-[#9CA3B5]">
                {search || status !== "all" || selectedLabelIds.length
                  ? "Try adjusting your filters or search."
                  : "Create a project task to get started."}
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <article
                key={task.id}
                className={`rounded-2xl border p-4 transition-colors sm:p-5 ${task.isCompleted ? "border-[#324B49] bg-[#172321]" : "border-[#2B3040] bg-[#1A1E29] hover:border-[#47516A]"}`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <input
                      type="checkbox"
                      aria-label={`Mark ${task.name} ${task.isCompleted ? "incomplete" : "complete"}`}
                      checked={task.isCompleted}
                      onChange={() => handleToggleTask(task)}
                      className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[#65C89B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`break-words text-sm font-semibold sm:text-base ${task.isCompleted ? "text-[#858DA0] line-through" : "text-[#F4F5F8]"}`}
                      >
                        {task.name}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#9CA3B5]">
                        <span className="inline-flex items-center gap-2 rounded-lg bg-[#141821] px-2.5 py-1.5">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{
                              backgroundColor: task.project.color ?? "#729EFF",
                            }}
                          />
                          <span className="break-words">
                            {task.project.name}
                          </span>
                        </span>
                        {task.labels.map((label) => (
                          <span
                            key={label.id}
                            className="rounded-full px-2.5 py-1 text-xs font-medium"
                            style={{
                              backgroundColor: label.color ?? "#6b7280",
                              color: contrastText(label.color),
                            }}
                          >
                            {label.name}
                          </span>
                        ))}
                        {task.dueDate && (
                          <span className="inline-flex items-center gap-1.5 text-[#9CA3B5]">
                            <CalendarDays size={14} />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 pl-8 sm:pl-0">
                    <button
                      type="button"
                      onClick={() => openEditDialog(task)}
                      className={subtleButton}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskToDelete(task)}
                      className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>

        {pagination.totalPages > 1 && (
          <nav
            aria-label="Task pages"
            className="mt-7 flex flex-wrap items-center justify-center gap-3"
          >
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className={`${subtleButton} inline-flex items-center gap-1.5`}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <span className="text-center text-xs text-[#9CA3B5] sm:text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              type="button"
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={page >= pagination.totalPages}
              className={`${subtleButton} inline-flex items-center gap-1.5`}
            >
              Next <ChevronRight size={16} />
            </button>
          </nav>
        )}
      </main>

      {taskToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-[2px]">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-task-title"
            aria-describedby="delete-task-description"
            className="w-full max-w-sm rounded-2xl border border-[#303543] bg-[#1A1E29] p-5 shadow-2xl sm:p-6"
          >
            <h2 id="delete-task-title" className="text-lg font-semibold">
              Delete task?
            </h2>
            <p
              id="delete-task-description"
              className="mt-2 break-words text-sm leading-6 text-[#9CA3B5]"
            >
              Are you sure you want to delete “{taskToDelete.name}”?
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                disabled={isDeleting}
                className={subtleButton}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTask}
                disabled={isDeleting}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {taskToEdit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-[2px]">
          <form
            onSubmit={handleEditTask}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-task-title"
            className="w-full max-w-md rounded-2xl border border-[#303543] bg-[#1A1E29] p-5 shadow-2xl sm:p-6"
          >
            <h2 id="edit-task-title" className="text-lg font-semibold">
              Edit task
            </h2>
            <div className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="edit-task-name"
                  className="mb-2 block text-sm font-medium"
                >
                  Task name
                </label>
                <input
                  id="edit-task-name"
                  type="text"
                  value={editTaskName}
                  onChange={(e) => setEditTaskName(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="edit-task-date"
                  className="mb-2 block text-sm font-medium"
                >
                  Due date
                </label>
                <input
                  id="edit-task-date"
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className={`${inputClass} scheme-dark`}
                />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setTaskToEdit(null)}
                disabled={isUpdating}
                className={subtleButton}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating || !editTaskName.trim()}
                className={primaryButton}
              >
                {isUpdating ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
