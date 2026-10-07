import dotenv from "dotenv"

dotenv.config({
    path: ".env.test",
    override: true
});

if (!process.env.TEST_DATABASE_URL) {
    throw new Error("TEST_DATABASE_URL is not defined");
}

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.NODE_ENV = "test";