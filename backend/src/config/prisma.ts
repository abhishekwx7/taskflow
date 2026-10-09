import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const isTest = process.env.NODE_ENV === "test";

const databaseUrl = process.env.DATABASE_URL;
const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!databaseUrl) {
    throw new Error("DATABASE_URL is not defined");
}

if (isTest) {
    if (!testDatabaseUrl) {
        throw new Error("TEST_DATABASE_URL is not defined");
    }

    const development = new URL(databaseUrl);
    const testing = new URL(testDatabaseUrl);

    if (
        development.hostname === testing.hostname &&
        development.port === testing.port &&
        development.pathname === testing.pathname &&
        development.username === testing.username
    ) {
        throw new Error(
            "SAFETY ERROR: Test database must be different from development database!",
        );
    }
}

const connectionString = isTest
    ? testDatabaseUrl!
    : databaseUrl;

const adapter = new PrismaPg({
    connectionString,
});

const prisma = new PrismaClient({
    adapter,
});

export default prisma;