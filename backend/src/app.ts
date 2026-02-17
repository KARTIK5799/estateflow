import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_, res) => {
  res.status(200).json({ status: "OK", service: "EstateFlow API" });
});

app.use("/api", routes);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
