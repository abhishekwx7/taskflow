import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.route.js";
import labelroutes from "./routes/label.route.js";

import {
    apiLimiter,
    authLimiter,
} from "./middleware/rateLimit.middleware.js";

const app = express();

app.use(cors());
app.use(helmet());

app.use(express.json({ limit: "10kb" }));

if (process.env.NODE_ENV !== "test") {
    app.use("/api", apiLimiter);
}

app.get("/", (_req, res) => {
    res.send("Backend is running 🚀");
});

if (process.env.NODE_ENV !== "test") {
    app.use("/api/auth", authLimiter, authRoutes);
} else {
    app.use("/api/auth", authRoutes);
}

app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/labels", labelroutes);

export default app;