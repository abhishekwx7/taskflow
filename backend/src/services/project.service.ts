import prisma from "../config/prisma.js";
import type { CreateProjectInput, UpdateProjectInput, projectQueryInput } from "../validations/project.validation.js";

export async function createProject(
    data: CreateProjectInput,
    userId: string
) {
    const project = await prisma.project.create({
        data: {
            ...data,
            userId
        }
    });

    return project;
}

export async function getProjects(userId: string, query: projectQueryInput) {
    const { search } = query;

    return await prisma.project.findMany({
        where: {
            userId,

            ...(search && {
                name: {
                    contains: search,
                    mode: "insensitive",
                },
            }),
        },
        orderBy: {
            createdAt: "desc"
        }
    })
}

export async function getProjectById(
    id: string,
    userId: string
) {
    return prisma.project.findFirst({
        where: {
            id,
            userId,
        }
    })
}

export async function updateProject(
    id: string,
    userId: string,
    data: UpdateProjectInput
) {
    return prisma.project.updateMany({
        where: {
            id,
            userId,
        },
        data,
    });
}

export async function deleteProjectService(
    id: string,
    userId: string,
) {
    const project = await prisma.project.findFirst({
        where: {
            id,
            userId,
        }
    });

    if (!project) {
        return null;
    }

    return prisma.project.delete({
        where: {
            id,
        }
    })
}