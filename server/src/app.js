import express from "express";
import cors from "cors";
import cookieparser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import roomRouter from "./routes/room.routes.js";
import dsaRouter from "./routes/dsa.routes.js";
import mockRouter from "./routes/interview.routes.js";
import executionRouter from "./routes/execution.routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());
app.use("/api/v1/users", userRouter);
app.use("/api/v1/warroom", roomRouter);
app.use("/api/v1/dsa", dsaRouter);
app.use("/api/v1/phantom", mockRouter);
app.use("/api/v1/execution", executionRouter);
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
