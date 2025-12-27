/**
 * Role-based Access Control Middleware
 * Supports both array and variadic arguments
 * Usage: roleMiddleware(["admin", "ngo"]) or roleMiddleware("admin", "ngo")
 */
const roleMiddleware = (allowedRolesInput) => {
  // Handle both array and variadic arguments
  let allowedRoles = Array.isArray(allowedRolesInput) 
    ? allowedRolesInput 
    : [allowedRolesInput];

  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(403).json({ 
          success: false, 
          message: "User information not found" 
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          success: false, 
          message: "You don't have permission to access this resource" 
        });
      }

      next();
    } catch (error) {
      console.error("Role middleware error:", error);
      res.status(403).json({ 
        success: false, 
        message: "Authorization check failed" 
      });
    }
  };
};

export default roleMiddleware;
