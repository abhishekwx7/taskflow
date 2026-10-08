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

describe("Task API", () => {
    beforeEach(async () => {
        await prisma.task.deleteMany();
        await prisma.project.deleteMany();
        await prisma.label.deleteMany();
        await prisma.user.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it("should create a task for authenticated user", async () => {
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

        const response = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Test Task",
            });

        expect(response.status).toBe(201);
        expect(response.body.task.name).toBe("Test Task");

        const task = await prisma.task.findFirst({
            where: {
                name: "Test Task",
            },
        });

        expect(task).not.toBeNull();
        expect(task?.projectId).toBe(projectId);
    });

    it("should update a task for authenticated user", async () => {
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

        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Test Task",
            });

        const taskId = taskResponse.body.task.id;

        const response = await request(app)
            .patch(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                isCompleted: true,
            });

        expect(response.status).toBe(200);
        expect(response.body.task.isCompleted).toBe(true);

        const task = await prisma.task.findUnique({
            where: {
                id: taskId,
            },
        });

        expect(task?.isCompleted).toBe(true);
    });

    it("should prevent user from accessing another user's task", async () => {
        await request(app)
            .post("/api/auth/signup")
            .send({
                name: "User A",
                email: "usera@example.com",
                password: "password123",
            });

        const signinA = await request(app)
            .post("/api/auth/signin")
            .send({
                email: "usera@example.com",
                password: "password123",
            });

        const tokenA = signinA.body.token;

        const projectResponse = await request(app)
            .post("/api/projects")
            .set("Authorization", `Bearer ${tokenA}`)
            .send({
                name: "User A Project",
                color: "#3b82f6",
            });

        const projectId = projectResponse.body.project.id;

        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${tokenA}`)
            .send({
                name: "User A Task",
            });

        const taskId = taskResponse.body.task.id;

        await request(app)
            .post("/api/auth/signup")
            .send({
                name: "User B",
                email: "userb@example.com",
                password: "password123",
            });

        const signinB = await request(app)
            .post("/api/auth/signin")
            .send({
                email: "userb@example.com",
                password: "password123",
            });

        const tokenB = signinB.body.token;

        const response = await request(app)
            .get(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${tokenB}`);

        expect(response.status).toBe(404);
    });
});