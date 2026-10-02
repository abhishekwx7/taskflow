import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import * as projectService from "../services/project.service.js";
import { createProjectSchema, projectQuerySchema, updateProjectSchema } from "../validations/project.validation.js"

export async function createProject(
    req: AuthRequest,
    res: Response
) {
    try {
        if (!req.userId) {
            return res.status(401).json({
                message: "Unauthorized!"
            })
        }

        const result = createProjectSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                message: "Invalid project data",
                errors: result.error,
            })
        }

        const project = await projectService.createProject(
            result.data,
            req.userId
        );

        return res.status(201).json({
            project,
        })
    }

    catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Failed to create project!"
        })
    }
}

export async function getProjects(
    req: AuthRequest,
    res: Response
) {
    try {
        if (!req.userId) {
            return res.status(401).json({
                message: "Unauthorized!"
            });
        }

        const result = projectQuerySchema.safeParse(req.query);

        if (!result.success) {
            return res.status(400).json({
                message: "Invalid query parameters!",
                errors: result.error.flatten()
            })
        }

        const projects = await projectService.getProjects(
            req.userId,
            result.data,
        );

        return res.status(200).json({
            projects,
        })
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Failed to fetch projects!"
        })
    }
}

export async function getProject(
    req: AuthRequest,
    res: Response
) {
    try {
        if (!req.userId) {
            return res.status(401).json({
                message: "Unauthorized!"
            });
        }

        const id = String(req.params.id);

        const project = await projectService.getProjectById(id, req.userId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found!"
            })
        }

        return res.status(200).json({
            project,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch project!"
        })
    }
}

export async function updateProject(
    req: AuthRequest,
    res: Response,
) {
    try {
        if (!req.userId) {
            return res.status(401).json({
                message: "Unauthorized!",
            });
        }

        const id = String(req.params.id);

        const result = updateProjectSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                message: "Invalid project data",
                errors: result.error,
            });
        }

        const updateResult = await projectService.updateProject(
            id,
            req.userId,
            result.data,
        );

        if (updateResult.count === 0) {
            return res.status(404).json({
                message: "Project not found!",
            });
        }

        const updatedProject =
            await projectService.getProjectById(
                id,
                req.userId,
            );

        return res.status(200).json({
            project: updatedProject,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Failed to update project!",
        });
    }
}
export async function deleteProject(
    req: AuthRequest,
    res: Response
) {
    try {
        if (!req.userId) {
            return res.status(401).json({
                message: "Unauthorized!"
            })
        }

        const id = String(req.params.id);

        const deletedProject = await projectService.deleteProjectService(
            id, req.userId,
        )

        if (!deletedProject) {
            return res.status(404).json({
                message: "Project not found!"
            })
        }

        return res.status(200).json({
            message: "Project deleted successfully!",
            project: deletedProject,
        })
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Failed to delete project!"
        })
    }
}