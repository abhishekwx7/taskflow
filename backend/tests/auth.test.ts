import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../src/app.js";

describe("Auth API", () => {
    it("should reject signup with invalid data", async () => {
        const response = await request(app).post("/api/auth/signup")
            .send({
                email: "invalid email",
                password: "123",
            });

        expect(response.status).toBe(400);
    });
});