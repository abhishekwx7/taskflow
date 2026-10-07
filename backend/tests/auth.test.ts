import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../src/app.js";

describe("Auth API", () => {
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

    it("should create a new user with valid data", async () => {
        const response = await request(app)
            .post("/api/auth/signup")
            .send({
                name: "Test User",
                email: "test@example.com",
                password: "password123",
            });

        expect(response.status).toBe(201);
        expect(response.body.user.email).toBe("test@example.com");
    });
});