import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import routes
import authRoutes from "./routes/AuthRoutes.js";
import ngoRoutes from "./routes/NgoRoutes.js";
import donorRoutes from "./routes/DonorRoutes.js";
import adminAuthRoutes from "./routes/admin/AdminAuthRoutes.js";
import approvalRoutes from "./routes/admin/ApprovalRoutes.js";
import orgRegistrationRoutes from "./routes/organization/OrganizationRegistrationRoutes.js";
import orgUsersRoutes from "./routes/organization/OrganizationUsersRoutes.js";


// Import middleware
import authMiddleware from "./middleware/auth.middleware.js";

dotenv.config();

const app = express();

// ============= MIDDLEWARE SETUP =============

// CORS Configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============= API ROUTES =============

// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "SEBN Backend is running 🚀",
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get("/", (req, res) => {
  res.json({ message: "SEBN Backend Running 🚀" });
});

// API routes
app.use("/api/auth/org", orgRegistrationRoutes);  // ← Organization registration
app.use("/api/auth", authRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/approvals", approvalRoutes);
app.use("/api/organization-users", orgUsersRoutes);  // ← Organization users
app.use("/api/ngo", authMiddleware, ngoRoutes);
app.use("/api/donor", donorRoutes);

// ============= ERROR HANDLING =============

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

export default app;
