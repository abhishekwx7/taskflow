import { z } from "zod";

export const createProjectSchema = z.object({
    name: z.string().trim().min(1, "Project name is required"),
    color: z.string().optional()
});

export const updateProjectSchema = z.object({
    name: z.string().trim().min(1, "Project name cannot be empty").optional(),
    color: z.string().optional()
}).refine((data) => data.name !== undefined || data.color !== undefined, {
    message: "Nothing to update",
})

export const projectQuerySchema = z.object({
    search: z.string().trim().max(100, "Search query is too long").optional(),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type projectQueryInput = z.infer<typeof projectQuerySchema>;