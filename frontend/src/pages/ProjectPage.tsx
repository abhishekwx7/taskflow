import { useParams } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";

import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
  type CreateTaskInput,
  type TaskSort,
} from "../services/task.service";

import type { Task } from "../types/task";
import type { Label } from "../types/label";

import {
  createLabel,
  getLabels,
  attachLabelToTask,
  removeLabelFromTask,
} from "../services/label.service";

export default function ProjectPage() {
  const { projectId } = useParams();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedLabelIds, setSelectedLabelsIds] = useState<string[]>([]);
  const [isLabelFilterOpen, setIsLabelFilterOpen] = useState(false);

  const [status, setStatus] = useState<"all" | "pending" | "completed">("all");

  const [sort, setSort] = useState<TaskSort>("newest");
  const [isSortOpen, setIsSortOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  useEffect(() => {
    async function fetchTasks() {
      if (!projectId) return;

      try {
        setError("");
        setIsLoading(true);

        const hasLabelFilter = selectedLabelIds.length > 0;

        const data = await getTasks(projectId, {
          ...(hasLabelFilter
            ? {
                labels: selectedLabelIds.join(),
              }
            : {
                search: debouncedSearch || undefined,
                status,
              }),
          sort,
        });

        setTasks(data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message =
            error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to fetch tasks";

          setError(message);
        } else {
          setError("Something went wrong!");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchTasks();
  }, [projectId, debouncedSearch, status, selectedLabelIds, sort]);

  function handleToggleFilterLabel(labelId: string) {
    setSearch("");
    setDebouncedSearch("");
    setStatus("all");

    setSelectedLabelsIds((prev) => {
      if (prev.includes(labelId)) {
        return prev.filter((id) => id !== labelId);
      }

      return [...prev, labelId];
    });
  }

  const [taskName, setTaskName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreateTask(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!projectId || !taskName.trim()) {
      return;
    }

    try {
      setError("");
      setIsCreating(true);

      const data: CreateTaskInput = {
        name: taskName.trim(),
      };

      if (dueDate) {
        data.dueDate = new Date(dueDate).toISOString();
      }

      const newTask = await createTask(projectId, data);

      setTasks((prev) => [newTask, ...prev]);

      setTaskName("");
      setDueDate("");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to create task";

        setError(message);
      } else {
        setError("Something went wrong!");
      }
    } finally {
      setIsCreating(false);
    }
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

  const sortedTask = [...tasks].sort(
    (a, b) => Number(a.isCompleted) - Number(b.isCompleted),
  );

  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [editTaskName, setEditTaskName] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

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

  const [labels, setLabels] = useState<Label[]>([]);

  const [labelTask, setLabelTask] = useState<Task | null>(null);

  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#3b82f6");

  const [isCreatingLabel, setIsCreatingLabel] = useState(false);

  useEffect(() => {
    async function fetchLabels() {
      try {
        const data = await getLabels();

        setLabels(data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message =
            error.response?.data?.message || "Failed to fetch labels";

          setError(message);
        } else {
          setError("Something went wrong!");
        }
      }
    }

    fetchLabels();
  }, []);

  async function handleAttachLabel(label: Label) {
    if (!labelTask) {
      return;
    }

    try {
      setError("");

      const updatedTask = await attachLabelToTask(labelTask.id, label.id);

      setTasks((prev) =>
        prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
      );

      setLabelTask(updatedTask);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Failed to attach label";

        setError(message);
      } else {
        setError("Something went wrong!");
      }
    }
  }

  async function handleRemoveLabel(taskId: string, labelId: string) {
    try {
      setError("");

      const updatedTask = await removeLabelFromTask(taskId, labelId);

      setTasks((prev) =>
        prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
      );

      if (labelTask?.id === updatedTask.id) {
        setLabelTask(updatedTask);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Failed to remove label";

        setError(message);
      } else {
        setError("Something went wrong!");
      }
    }
  }

  async function handleCreateLabel(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!newLabelName.trim()) {
      return;
    }

    try {
      setError("");
      setIsCreatingLabel(true);

      const newLabel = await createLabel({
        name: newLabelName.trim(),
        color: newLabelColor,
      });

      setLabels((prev) => [newLabel, ...prev]);

      setNewLabelName("");
      setNewLabelColor("#3b82f6");

      if (labelTask) {
        await handleAttachLabel(newLabel);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Failed to create label";

        setError(message);
      } else {
        setError("Something went wrong!");
      }
    } finally {
      setIsCreatingLabel(false);
    }
  }

  {
    /* JSX PART */
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold">Tasks</h1>
        <div className="mb-4">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full rounded-lg border bg-white px-4 py-2 shadow-sm"
          />
        </div>
        {error && (
          <p className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</p>
        )}
        <form
          onSubmit={handleCreateTask}
          className="mb-6 flex flex-col gap-3 rounded-lg bg-white p-4 shadow sm:flex-row"
        >
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Task Name"
            className="flex-1 rounded border px-3 py-2"
          />

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded border px-3 py-2"
          />

          <button
            type="submit"
            disabled={isCreating || !taskName.trim()}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCreating ? "Creating..." : "Add Task"}
          </button>
        </form>
        <div className="mb-4 flex justify-between">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedLabelsIds([]);
                setStatus("all");
              }}
              className="rounded border px-3 py-2"
            >
              All
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedLabelsIds([]);
                setStatus("pending");
              }}
              className="rounded border px-3 py-2 bg-yellow-300"
            >
              Pending
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedLabelsIds([]);
                setStatus("completed");
              }}
              className="rounded border px-3 py-2 bg-green-300"
            >
              Completed
            </button>

            <button
              type="button"
              onClick={() => setIsLabelFilterOpen((prev) => !prev)}
              className="rounded border px-3 py-2 bg-gray-500"
            >
              Filter by labels
              {selectedLabelIds.length > 0 && ` (${selectedLabelIds.length})`}
            </button>
          </div>

          <div className="relative">
            <button
              type="button"
              className="rounded border-amber-200 px-3 py-2 bg-amber-800"
              onClick={() => setIsSortOpen((prev) => !prev)}
            >
              Sort
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-32 rounded-lg border bg-white shadow-lg z-10 text-center">
                <button
                  type="button"
                  onClick={() => setSort("oldest")}
                  className="block w-full border-b px-3 py-2 hover:bg-gray-300"
                >
                  Newest
                </button>

                <button
                  type="button"
                  onClick={() => setSort("oldest")}
                  className="block w-full border-b px-3 py-2 hover:bg-gray-300"
                >
                  Oldest
                </button>

                <button
                  type="button"
                  onClick={() => setSort("dueDateAsc")}
                  className="block w-full border-b px-3 py-2 hover:bg-gray-300"
                >
                  Due date: earliest
                </button>

                <button
                  type="button"
                  onClick={() => setSort("dueDateDesc")}
                  className="block w-full border-b px-3 py-2 hover:bg-gray-300"
                >
                  Due date: latest
                </button>

                <button
                  type="button"
                  onClick={() => setSort("nameAsc")}
                  className="block w-full border-b px-3 py-2 hover:bg-gray-300"
                >
                  Name A-Z
                </button>

                <button
                  type="button"
                  onClick={() => setSort("nameDesc")}
                  className="block w-full hover:bg-gray-300"
                >
                  Name Z-A
                </button>
              </div>
            )}
          </div>
        </div>

        {isLabelFilterOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
              <h2 className="text-lg font-semibold">Filter by labels</h2>

              <div className="mt-4">
                {labels.length === 0 ? (
                  <p className="text-sm text-gray-500">No labels available.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {labels.map((label) => {
                      const selected = selectedLabelIds.includes(label.id);

                      return (
                        <button
                          key={label.id}
                          type="button"
                          onClick={() => handleToggleFilterLabel(label.id)}
                          className={`rounded-full px-3 py-1 text-sm text-white ${
                            selected ? "ring-2 ring-black" : ""
                          }`}
                          style={{
                            backgroundColor: label.color || "#6b7280",
                          }}
                        >
                          {label.name}
                          {selected ? " ✓" : ""}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedLabelsIds([])}
                  className="rounded border px-4 py-2"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={() => setIsLabelFilterOpen(false)}
                  className="rounded bg-blue-600 px-4 py-2 text-white"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LAOD TASKS */}

        {isLoading ? (
          <p>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="text-gray-500">
            {debouncedSearch
              ? `No tasks found for "${debouncedSearch}".`
              : `No tasks yet. Create your first task.`}
          </p>
        ) : (
          <div className="space-y-3">
            {sortedTask.map((task) => (
              <div
                key={task.id}
                className={`rounded-lg p-4 shadow ${
                  task.isCompleted ? "bg-green-400" : "bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={task.isCompleted}
                      onChange={() => handleToggleTask(task)}
                      className="mt-1 h-4 w-4"
                    />

                    <div>
                      <h2
                        className={`font-semibold ${
                          task.isCompleted ? "text-green-700 line-through" : ""
                        }`}
                      >
                        {task.name}
                      </h2>

                      {task.dueDate && (
                        <p className="text-sm text-gray-600">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {task.labels.map((label) => (
                      <span
                        key={label.id}
                        className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-white"
                        style={{
                          backgroundColor: label.color || "#6b7280",
                        }}
                      >
                        {label.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveLabel(task.id, label.id)}
                          className="font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}

                    <button
                      type="button"
                      onClick={() => setLabelTask(task)}
                      className="rounded border px-2 py-1 text-xs text-gray-600"
                    >
                      + Add label
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditDialog(task)}
                      className="rounded bg-blue-500 px-3 py-1 text-sm text-white"
                    >
                      Edit
                    </button>

                    <button
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
                  onClick={() => setTaskToDelete(null)}
                  disabled={isDeleting}
                  className="rounded border px-4 py-2"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDeleteTask}
                  disabled={isDeleting}
                  className="rounded bg-red-600 px-4 py-2 text-shite disabled:opacity-50"
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
                <label className="mb-1 block text-sm font-medium">
                  Due Date
                </label>

                <input
                  type="text"
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
                  {isUpdating ? "Saving" : "Save"}
                </button>
              </div>
            </form>
          </div>
        )}
        {labelTask && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
              <h2 className="text-lg font-semibold">
                Labels for "{labelTask.name}"
              </h2>

              <div className="mt-4">
                <p className="mb-2 text-sm font-medium">Existing labels</p>

                {labels.length === 0 ? (
                  <p className="text-sm text-gray-500">No labels yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {labels.map((label) => {
                      const attached = labelTask.labels.some(
                        (taskLabel) => taskLabel.id === label.id,
                      );

                      return (
                        <button
                          key={label.id}
                          type="button"
                          onClick={() => {
                            if (!attached) {
                              handleAttachLabel(label);
                            }
                          }}
                          disabled={attached}
                          className="rounded-full px-3 py-1 text-sm text-white disabled:opacity-40"
                          style={{
                            backgroundColor: label.color || "#6b7280",
                          }}
                        >
                          {label.name}
                          {attached ? " ✓" : ""}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <form onSubmit={handleCreateLabel} className="mt-6 border-t pt-4">
                <p className="mb-3 text-sm font-medium">Create new label</p>

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    placeholder="Label name"
                    className="flex-1 rounded border px-3 py-2"
                  />

                  <input
                    type="color"
                    value={newLabelColor}
                    onChange={(e) => setNewLabelColor(e.target.value)}
                    className="h-10 w-12 cursor-pointer"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setLabelTask(null)}
                    className="rounded border px-4 py-2"
                  >
                    Close
                  </button>

                  <button
                    type="submit"
                    disabled={isCreatingLabel || !newLabelName.trim()}
                    className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                  >
                    {isCreatingLabel ? "Creating..." : "Create label"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
