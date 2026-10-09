import dotenv from "dotenv"

dotenv.config({
    path: ".env.test",
    override: true
});

process.env.NODE_ENV = "test";

if (!process.env.TEST_DATABASE_URL) {
    throw new Error("TEST_DATABASE_URL is not defined");
}

