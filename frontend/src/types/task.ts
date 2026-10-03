import type { Label } from "./label";

export interface TaskProject {
    id: string;
    name: string;
    color: string | null;
}

export interface Task {
    id: string;
    name: string;
    isCompleted: boolean;
    dueDate: string | null;
    projectId: string;
    project: TaskProject;
    labels: Label[];
    createdAt: string;
    updatedAt: string;
}