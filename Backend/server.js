import dotenv from "dotenv";
import { connectDB, disconnectDB } from "./config/db.js";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

/**
 * Start server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   🚀 SEBN Backend Server Started              ║
║   ✅ Port: ${PORT}                            ║
║   ✅ Environment: ${process.env.NODE_ENV || "development"}                  ║
║   ✅ Database: MongoDB                        ║
║                                               ║
╚═══════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      console.log("\n🛑 Shutting down gracefully...");
      server.close(async () => {
        await disconnectDB();
        console.log("✅ Server closed");
        process.exit(0);
      });
    });

    process.on("SIGTERM", async () => {
      console.log("\n🛑 Shutting down gracefully...");
      server.close(async () => {
        await disconnectDB();
        console.log("✅ Server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
