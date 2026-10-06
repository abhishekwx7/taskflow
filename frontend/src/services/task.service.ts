import api from "../lib/api";
import type { Task } from "../types/task";

interface TasksResponse {
    tasks: Task[];
}

interface GetAllTasksResponse {
    tasks: Task[];

    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };

    stats: {
        completed: number;
    };
}

export type TaskSort =
    | "newest"
    | "oldest"
    | "dueDateAsc"
    | "dueDateDesc"
    | "nameAsc"
    | "nameDesc";

export interface GetTasksQuery {
    search?: string;
    status?: "all" | "pending" | "completed";
    labels?: string;
    sort?: TaskSort;
}

export interface GetAllTasksQuery extends GetTasksQuery {
    page?: number;
    limit?: number;
}

export async function getTasks(
    projectId: string,
    query?: GetTasksQuery,
) {
    const response = await api.get<TasksResponse>(
        `projects/${projectId}/tasks`,
        {
            params: query,
        },
    );

    return response.data.tasks;
}

export async function getAllTasks(
    query?: GetAllTasksQuery,
) {
    const response = await api.get<GetAllTasksResponse>(
        "/tasks",
        {
            params: query,
        },
    );

    return response.data;
}

export interface CreateTaskInput {
    name: string;
    dueDate?: string;
}

export async function createTask(
    projectId: string,
    data: CreateTaskInput,
) {
    const response = await api.post<{ task: Task }>(
        `/projects/${projectId}/tasks`,
        data,
    );

    return response.data.task;
}

export interface UpdateTaskInput {
    name?: string;
    dueDate?: string;
    isCompleted?: boolean;
}

interface UpdateTaskResponse {
    task: Task;
}

export async function updateTask(
    taskId: string,
    data: UpdateTaskInput,
) {
    const response = await api.patch<UpdateTaskResponse>(
        `/tasks/${taskId}`,
        data,
    );

    return response.data.task;
}

export async function deleteTask(taskId: string) {
    const response = await api.delete(`/tasks/${taskId}`);

    return response.data.task;
}