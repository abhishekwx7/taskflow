import { useEffect, useState } from "react";
import { getAllTasks, updateTask, deleteTask } from "../services/task.service";
import type { Task } from "../types/task";
import axios from "axios";

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [editTaskName, setEditTaskName] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function fetchTasks() {
      try {
        setError("");
        setIsLoading(true);

        const data = await getAllTasks();

        setTasks(data);
      } catch (error) {
        setError("Failed to fetch tasks!");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTasks();
  }, []);

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
