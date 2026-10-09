import { describe, expect, it } from "vitest";
import prisma from "../src/config/prisma.js";
import { assertTestDatabase } from "./assertTestDatabase.js";

describe("Database isolation", () => {
    it("connects to the authorized test database", async () => {
        await expect(
            assertTestDatabase(prisma),
        ).resolves.toBeUndefined();
    });
});