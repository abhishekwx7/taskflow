import api from "../lib/api";

import type {
    CreateProjectInput,
    UpdateProjectInput,
    ProjectsResponse,
    ProjectResponse,
    DeleteProjectResponse,
} from "../types/projects";

export interface GetProjectsQuery {
    search?: string;
}

export async function getProjects(query?: GetProjectsQuery) {
    const response = await api.get<ProjectsResponse>("/projects", {
        params: query,
    });

    return response.data.projects;
}

export async function getProject(projectId: string) {
    const response = await api.get<ProjectResponse>(
        `/projects/${projectId}`,
    );

    return response.data.project;
}

export async function createProject(data: CreateProjectInput) {
    const response = await api.post<ProjectResponse>(
        "/projects",
        data,
    );

    return response.data.project;
}

export async function updateProject(
    projectId: string,
    data: UpdateProjectInput,
) {
    const response = await api.patch<ProjectResponse>(
        `/projects/${projectId}`,
        data,
    );

    return response.data.project;
}

export async function deleteProject(projectId: string) {
    const response = await api.delete<DeleteProjectResponse>(
        `/projects/${projectId}`,
    );

    return response.data;
}