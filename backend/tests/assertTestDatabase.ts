import { PrismaClient } from "../src/generated/prisma/client.js";

export async function assertTestDatabase(
    prisma: PrismaClient,
) {
    if (process.env.NODE_ENV !== "test") {
        throw new Error(
            "SAFETY ERROR: NODE_ENV must be test",
        );
    }

    const result = await prisma.$queryRaw<
        Array<{ id: number }>
    >`
    SELECT id
    FROM _test_environment_guard
    WHERE id = 1
  `;

    if (result.length !== 1) {
        throw new Error(
            "SAFETY ERROR: Database is not marked for testing",
        );
    }
}