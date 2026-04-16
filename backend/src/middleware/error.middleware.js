import { HttpError } from "../utils/httpError.js";
import { ZodError } from "zod";

export function notFoundMiddleware(req, res) {
  res.status(404).json({ message: "Route not found" });
}

export function errorMiddleware(err, req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      details: err.flatten(),
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      message: err.message,
      details: err.details,
    });
  }

  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
}
