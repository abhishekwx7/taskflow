import { useEffect, useState } from "react";
import { getAllTasks } from "../services/task.service";
import type { Task } from "../types/task";

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

      <div className="mt-8 space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="rounded-lg border bg-white p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={task.isCompleted}
                readOnly
                className="mt-1"
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
                      className="rounded-full px-2 py-1 text-xs"
                      style={{
                        backgroundColor: label.color ?? "#e5e7eb",
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
          </div>
        ))}
      </div>
    </div>
  );
}
