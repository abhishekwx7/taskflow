import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import * as taskService from "../services/task.service.js";
import { createTaskSchema, taskQuerySchema, updateTaskSchema } from "../validations/task.validation.js";

export async function createTask(
    req: AuthRequest,
    res: Response,
) {
    try {
        if (!req.userId) {
            return res.status(401).json({
                message: "Unauthorized!"
            })
        }

        const projectId = req.params.projectId;

        if (!projectId || Array.isArray(projectId)) {
            return res.status(400).json({
                message: "Project ID is required!"
            })
        }

        const result = createTaskSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                message: "Invalid task data",
                errors: result.error,
            })
        }

        const task = await taskService.createTask(
            projectId,
            result.data,
            req.userId
        );

        if (!task) {
            return res.status(404).json({
                message: "Project not found!"
            })
        }

        return res.status(201).json({
            task,
        })


    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Failed to create task",
        });
    }
}

export async function getTasks(
    req: AuthRequest,
    res: Response,
) {
    try {
        if (!req.userId) {
            return res.status(401).json({
                message: "Unauthorized!"
            });
        }

        const projectId = req.params.projectId;
        // console.log(req.params);

        if (!projectId || Array.isArray(projectId)) {
            return res.status(400).json({
                message: "Project ID is required!"
            });
        }

        const result = taskQuerySchema.safeParse(req.query);

        if (!result.success) {
            return res.status(400).json({
                message: "Invalid query parameters!",
                errors: result.error.flatten()
            })
        }

        const tasks = await taskService.getTasks(
            projectId,
            req.userId,
            result.data,
        )

        if (!tasks) {
            return res.status(404).json({
                message: "Project not found!"
            })
        }

        return res.status(200).json({
            tasks
        })
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Failed to fetch tasks",
        });
    }
}

export async function getTask(
    req: AuthRequest,
    res: Response,
) {
    try {
        if (!req.userId) {
            return res.status(401).json({
                message: "Unauthorized!"
            })
        }

        const taskId = req.params.id;

        if (!taskId || Array.isArray(taskId)) {
            return res.status(400).json({
                message: "Task ID is required!"
            });
        }

        const task = await taskService.getTaskById(
            taskId,
            req.userId,
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found!"
            });
        }

        return res.status(200).json({
            task,
        })
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Failed to fetch task",
        });
    }
}

export async function getAllTasks(
    req: AuthRequest,
    res: Response,
) {
    try {
        if (!req.userId) {
            return res.status(401).json({
                message: "Unauthorized!",
            });
        }

        const tasks = await taskService.getAllTasks(
            req.userId,
        );

        return res.status(200).json({
            tasks,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Failed to fetch tasks",
        });
    }
}

export async function updateTask(
    req: AuthRequest,
    res: Response,
) {
    try {
        if (!req.userId) {
            return res.status(401).json({
                message: "Unauthorized!"
            });
        }

        const taskid = req.params.id;

        if (!taskid || Array.isArray(taskid)) {
            return res.status(400).json({
                message: "Task ID is required!"
            });
        }

        const result = updateTaskSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                message: "Invalid task data",
                errors: result.error,
            })
        }

        const updatedTask = await taskService.updateTask(
            taskid,
            result.data,
            req.userId,
        )

        if (!updatedTask) {
            return res.status(404).json({
                message: "Task not found!"
            })
        }

        return res.status(200).json({
            task: updatedTask,
        })
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Failed to update task",
        });
    }
}

export async function deleteTask(
    req: AuthRequest,
    res: Response,
) {
    try {
        if (!req.userId) {
            return res.status(401).json({
                message: "Unauthorized!"
            })
        }

        const taskId = req.params.id;

        if (!taskId || Array.isArray(taskId)) {
            return res.status(400).json({
                message: "Task ID is required!"
            });
        }

        const deletedTask = await taskService.deleteTask(
            taskId,
            req.userId,
        );

        if (!deletedTask) {
            return res.status(404).json({
                message: "Task not found!"
            })
        }

        return res.status(200).json({
            message: "Task deleted successfully!",
            task: deletedTask,
        })
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Failed to delete task",
        });
    }
}

export async function attachLabel(
    req: AuthRequest,
    res: Response
) {
    try {
        if (!req.userId) {
            return res.status(401).json({
                message: "Unauthorized!"
            });
        }

        const taskId = req.params.taskId;
        const labelId = req.params.labelId;

        if (!taskId || !labelId || Array.isArray(taskId) || Array.isArray(labelId)) {
            return res.status(400).json({
                message: "Task ID and label ID are required!"
            });
        }

        const task = await taskService.attachLabelToTask(
            taskId,
            labelId,
            req.userId
        )

        return res.status(200).json({
            message: "Label attached successfully!",
            task,
        })

    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "Task not found") {
                return res.status(400).json({
                    message: error.message,
                });
            }

            if (error.message === "Label not found") {
                return res.status(400).json({
                    message: error.message,
                })
            }
        }
        console.log(error);

        return res.status(500).json({
            message: "Failed to attach label!",
        })
    }
}

export async function removeLabel(
    req: AuthRequest,
    res: Response
) {
    try {
        if (!req.userId) {
            return res.status(401).json({
                message: "Unauthorized!",
            });
        }

        const taskId = req.params.taskId;
        const labelId = req.params.labelId;

        if (!taskId || !labelId || Array.isArray(taskId) || Array.isArray(labelId)) {
            return res.status(400).json({
                message: "Task ID and label ID are required!"
            });
        }

        const task = await taskService.removeLabelfromTask(
            taskId,
            labelId,
            req.userId
        )

        return res.status(200).json({
            message: "Label removed successfully!",
            task,
        })

    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "Task not found" || error.message === "Label not found") {
                return res.status(400).json({
                    message: error.message,
                })
            }
        }
        console.log(error);

        return res.status(500).json({
            message: "Failed to remove label!"
        })
    }
}