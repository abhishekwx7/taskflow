import request from "supertest";
import {
    afterAll,
    beforeEach,
    describe,
    expect,
    it,
} from "vitest";

import app from "../src/app.js";
import prisma from "../src/config/prisma.js";

describe("Task Query API", () => {
    beforeEach(async () => {
        await prisma.task.deleteMany();
        await prisma.project.deleteMany();
        await prisma.label.deleteMany();
        await prisma.user.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it("should search, filter, and sort tasks", async () => {
        await request(app)
            .post("/api/auth/signup")
            .send({
                name: "Test User",
                email: "test@example.com",
                password: "password123",
            });

        const signinResponse = await request(app)
            .post("/api/auth/signin")
            .send({
                email: "test@example.com",
                password: "password123",
            });

        const token = signinResponse.body.token;

        const projectResponse = await request(app)
            .post("/api/projects")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Test Project",
                color: "#3b82f6",
            });

        const projectId = projectResponse.body.project.id;

        await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Learn React",
            });

        const completedTaskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Learn TypeScript",
            });

        await request(app)
            .patch(`/api/tasks/${completedTaskResponse.body.task.id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                isCompleted: true,
            });

        await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Build Project",
            });

        const response = await request(app)
            .get(
                `/api/projects/${projectId}/tasks?search=Learn&status=completed&sort=nameAsc`,
            )
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.tasks).toHaveLength(1);
        expect(response.body.tasks[0].name).toBe("Learn TypeScript");
        expect(response.body.tasks[0].isCompleted).toBe(true);
    });

    it("should paginate tasks", async () => {
        await request(app)
            .post("/api/auth/signup")
            .send({
                name: "Test User",
                email: "test@example.com",
                password: "password123",
            });

        const signinResponse = await request(app)
            .post("/api/auth/signin")
            .send({
                email: "test@example.com",
                password: "password123",
            });

        const token = signinResponse.body.token;

        const projectResponse = await request(app)
            .post("/api/projects")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Test Project",
                color: "#3b82f6",
            });

        const projectId = projectResponse.body.project.id;

        for (let i = 1; i <= 5; i++) {
            await request(app)
                .post(`/api/projects/${projectId}/tasks`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    name: `Task ${i}`,
                });
        }

        const response = await request(app)
            .get("/api/tasks?page=1&limit=2")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.tasks).toHaveLength(2);

        expect(response.body.pagination.page).toBe(1);
        expect(response.body.pagination.limit).toBe(2);
        expect(response.body.pagination.total).toBe(5);
        expect(response.body.pagination.totalPages).toBe(3);
    });
});