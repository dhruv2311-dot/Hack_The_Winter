import jwt from "jsonwebtoken";
import Admin from "../models/admin/Admin.js";

/**
 * Admin Authentication Middleware
 * ✅ Verifies JWT token is from admin
 * ✅ Checks admin still exists and is active
 * ✅ Used on all admin endpoints
 */
const adminAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No admin token provided"
      });
    }

    // Verify JWT signature
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "admin_jwt_secret"
    );

    // ✅ CRITICAL: Verify admin still exists and is active
    const admin = await Admin.findById(decoded.id);

    if (!admin || !admin.isActive || admin.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin not authorized"
      });
    }

    // Attach admin data to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      adminCode: decoded.adminCode,
      role: "ADMIN",
      permissions: admin.permissions
    };

    next();

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Admin token has expired"
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid admin token"
    });
  }
};

export default adminAuthMiddleware;
