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
import { assertTestDatabase } from "./assertTestDatabase.js";

describe("Project API", () => {
    beforeEach(async () => {
        await assertTestDatabase(prisma);
        await prisma.task.deleteMany();
        await prisma.project.deleteMany();
        await prisma.user.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it("should create a project for authenticated user", async () => {
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

        const response = await request(app)
            .post("/api/projects")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Test Project",
                color: "#3b82f6",
            });

        expect(response.status).toBe(201);
        expect(response.body.project.name).toBe("Test Project");

        const project = await prisma.project.findFirst({
            where: {
                name: "Test Project",
            },
        });

        expect(project).not.toBeNull();
        expect(project?.name).toBe("Test Project");
    });

    it("should reject project creation without authentication", async () => {
        const response = await request(app)
            .post("/api/projects")
            .send({
                name: "Test Project",
                color: "#3b82f6",
            });

        expect(response.status).toBe(401);
    });

    it("should prevent user from accessing another user's project", async () => {
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

        const createProjectResponse = await request(app)
            .post("/api/projects")
            .set("Authorization", `Bearer ${tokenA}`)
            .send({
                name: "User A Project",
                color: "#3b82f6",
            });

        const projectId = createProjectResponse.body.project.id;

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
            .get(`/api/projects/${projectId}`)
            .set("Authorization", `Bearer ${tokenB}`);

        expect(response.status).toBe(404);
    });
});