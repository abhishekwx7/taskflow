import prisma from "../config/prisma.js";
import type { CreateTaskInput, TaskQueryInput, UpdateTaskInput } from "../validations/task.validation.js";


export async function createTask(
    projectId: string,
    data: CreateTaskInput,
    userId: string
) {

    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            userId,
        }
    });

    if (!project) {
        return null;
    }

    const task = await prisma.task.create({
        data: {
            ...data,
            projectId,
        },
        include: {
            labels: true
        }
    });

    return task;
}

export async function getTasks(projectId: string, userId: string, query: TaskQueryInput) {
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            userId,
        }
    });

    if (!project) {
        return null;
    }

    const { search, status, labels, sort } = query;

    const hasLabelFilter = labels !== undefined && labels.length > 0;

    let sortOrder;

    switch (sort) {
        case "oldest":
            sortOrder = {
                createdAt: "asc" as const,
            };
            break;

        case "dueDateAsc":
            sortOrder = {
                dueDate: {
                    sort: "asc" as const,
                    nulls: "last" as const,
                },
            };
            break;

        case "dueDateDesc":
            sortOrder = {
                dueDate: {
                    sort: "desc" as const,
                    nulls: "last" as const,
                },
            };
            break;

        case "nameAsc":
            sortOrder = {
                name: "asc" as const,
            };
            break;

        case "nameDesc":
            sortOrder = {
                name: "desc" as const,
            };
            break;

        case "newest":
        default:
            sortOrder = {
                createdAt: "desc" as const,
            };
    }

    return await prisma.task.findMany({
        where: {
            projectId,

            ...(hasLabelFilter ? {
                labels: {
                    some: {
                        id: {
                            in: labels
                        }
                    }
                }
            } : {
                ...(search && {
                    name: {
                        contains: search,
                        mode: "insensitive"
                    },
                }),

                ...(status === "pending" && {
                    isCompleted: false,
                }),

                ...(status === "completed" && {
                    isCompleted: true,
                })

            })
        },
        include: {
            labels: true,
        },
        orderBy: [
            {
                isCompleted: "asc",
            },
            sortOrder,
        ]
    })
}

export async function getTaskById(taskId: string, userId: string) {
    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            project: {
                userId,
            },
        },
        include: {
            labels: true,
        }
    });

    return task;
}

export async function getAllTasks(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const where = {
        project: {
            userId,
        },
    };

    const [tasks, total] = await Promise.all([
        prisma.task.findMany({
            where,
            include: {
                labels: true,
                project: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: limit,
        }),

        prisma.task.count({
            where,
        }),
    ]);


    return {
        tasks,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function updateTask(
    taskId: string,
    data: UpdateTaskInput,
    userId: string
) {
    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            project: {
                userId,
            },
        },
    });

    if (!task) {
        return null;
    }

    return prisma.task.update({
        where: {
            id: taskId,
        },
        data,
        include: {
            labels: true,
            project: {
                select: {
                    id: true,
                    name: true,
                    color: true,
                },
            },
        },
    });
}

export async function deleteTask(
    taskId: string, userId: string,
) {
    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            project: {
                userId,
            },
        },
    });

    if (!task) {
        return null;
    }

    return prisma.task.delete({
        where: {
            id: taskId,
        }
    })
}

export async function attachLabelToTask(
    taskId: string,
    labelId: string,
    userId: string
) {
    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            project: {
                userId,
            },
        },
    });

    if (!task) {
        throw new Error("Task not found");
    }

    const label = await prisma.label.findFirst({
        where: {
            id: labelId,
            userId,
        },
    });

    if (!label) {
        throw new Error("Label not found");
    }

    return prisma.task.update({
        where: {
            id: taskId,
        },
        data: {
            labels: {
                connect: {
                    id: labelId,
                },
            },
        },
        include: {
            labels: true,
        },
    });
}

export async function removeLabelfromTask(
    taskId: string,
    labelId: string,
    userId: string,
) {
    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            project: {
                userId,
            },
        },
    });

    if (!task) {
        throw new Error("Task not found")
    }

    const label = await prisma.label.findFirst({
        where: {
            id: labelId,
            userId,
        },
    });

    if (!label) {
        throw new Error("Label not found")
    }

    return prisma.task.update({
        where: {
            id: taskId,
        },
        data: {
            labels: {
                disconnect: {
                    id: labelId,
                },
            },
        },
        include: {
            labels: true,
        },
    });
}