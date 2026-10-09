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

describe("Auth API", () => {
    beforeEach(async () => {
        await assertTestDatabase(prisma);
        await prisma.task.deleteMany();
        await prisma.project.deleteMany();
        await prisma.label.deleteMany();
        await prisma.user.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it("should reject signup with invalid data", async () => {
        const response = await request(app)
            .post("/api/auth/signup")
            .send({
                email: "invalid-email",
                password: "123",
            });

        expect(response.status).toBe(400);
    });

    it("should reject access to protected route without token", async () => {
        const response = await request(app)
            .get("/api/auth/me");

        expect(response.status).toBe(401);
    });

    it("should create a user with valid data", async () => {
        const response = await request(app)
            .post("/api/auth/signup")
            .send({
                name: "Test User",
                email: "test@example.com",
                password: "password123",
            });

        expect(response.status).toBe(201);
        expect(response.body.user.email).toBe("test@example.com");

        const user = await prisma.user.findUnique({
            where: {
                email: "test@example.com",
            },
        });

        expect(user).not.toBeNull();
        expect(user?.email).toBe("test@example.com");
    });

    it("should reject signup with duplicate email", async () => {
        const userData = {
            name: "Test User",
            email: "test@example.com",
            password: "password123",
        };

        await request(app)
            .post("/api/auth/signup")
            .send(userData);

        const response = await request(app)
            .post("/api/auth/signup")
            .send(userData);

        expect(response.status).toBe(400);
    });

    it("should signin with valid credentials", async () => {
        await request(app)
            .post("/api/auth/signup")
            .send({
                name: "Test User",
                email: "test@example.com",
                password: "password123",
            });

        const response = await request(app)
            .post("/api/auth/signin")
            .send({
                email: "test@example.com",
                password: "password123",
            });

        expect(response.status).toBe(200);
        expect(response.body.user.email).toBe("test@example.com");
        expect(response.body.token).toBeDefined();
    });

    it("should reject signin with wrong password", async () => {
        await request(app)
            .post("/api/auth/signup")
            .send({
                name: "Test User",
                email: "test@example.com",
                password: "password123",
            });

        const response = await request(app)
            .post("/api/auth/signin")
            .send({
                email: "test@example.com",
                password: "wrongpassword",
            });

        expect(response.status).toBe(400);
    });

    it("should return current user with valid token", async () => {
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
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.user.email).toBe("test@example.com");
    });
});