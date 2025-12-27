import jwt from "jsonwebtoken";

/**
 * Authentication Middleware - Verify JWT token
 */
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token has expired" });
    }
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export default authMiddleware;
