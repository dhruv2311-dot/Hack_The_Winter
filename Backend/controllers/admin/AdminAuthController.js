import Admin from "../../models/admin/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ============= VALIDATORS =============

const validateAdminLoginInput = (data) => {
  const errors = [];
  if (!data.email) {
    errors.push("Email is required");
  }
  if (!data.password) {
    errors.push("Password is required");
  }
  return errors;
};

const validateAdminRegistrationInput = (data) => {
  const errors = [];
  if (!data.email) {
    errors.push("Email is required");
  }
  if (!data.password) {
    errors.push("Password is required");
  }
  if (!data.name) {
    errors.push("Name is required");
  }
  if (!data.adminCode) {
    errors.push("Admin code is required");
  }
  if (!Array.isArray(data.permissions) || data.permissions.length === 0) {
    errors.push("Permissions array is required");
  }
  
  // Password strength validation
  if (data.password && data.password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  
  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.email && !emailRegex.test(data.email)) {
    errors.push("Invalid email format");
  }
  
  return errors;
};

// ============= RESPONSE HANDLERS =============

const sendSuccess = (res, data, message = "Success", statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const sendError = (res, message = "An error occurred", statusCode = 500) => {
  res.status(statusCode).json({
    success: false,
    message,
    data: null
  });
};

// ============= ADMIN LOGIN =============

/**
 * Admin Login - Secure admin-only access
 * ✅ Verifies admin exists in Admin collection
 * ✅ NOT using general User collection
 * ✅ Audit logs login attempts
 */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Validate input
    const validationErrors = validateAdminLoginInput(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors
      });
    }

    // ✅ Find ADMIN (from Admin collection, not User collection)
    const admin = await Admin.findByEmail(email);

    if (!admin) {
      return sendError(res, "Invalid admin credentials", 401);
    }

    // ✅ Check if admin is active
    if (!admin.isActive) {
      return sendError(res, "Admin account is inactive", 403);
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      // Record failed login
      await Admin.updateLoginHistory(admin._id, ipAddress, false);
      return sendError(res, "Invalid admin credentials", 401);
    }

    // ✅ Record successful login
    await Admin.updateLoginHistory(admin._id, ipAddress, true);

    // Generate JWT token with admin-specific claims
    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        adminCode: admin.adminCode,
        role: "ADMIN",
        permissions: admin.permissions
      },
      process.env.JWT_SECRET || "admin_jwt_secret",
      { expiresIn: "24h" }
    );

    // Remove sensitive data
    const adminData = {
      _id: admin._id,
      adminCode: admin.adminCode,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
      permissions: admin.permissions
    };

    sendSuccess(res, {
      token,
      admin: adminData
    }, "Admin login successful", 200);

  } catch (error) {
    console.error("Admin login error:", error);
    sendError(res, "Login failed", 500);
  }
};

/**
 * Get Current Admin Profile
 */
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);

    if (!admin || !admin.isActive) {
      return sendError(res, "Admin not found", 404);
    }

    const adminData = {
      _id: admin._id,
      adminCode: admin.adminCode,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
      permissions: admin.permissions,
      loginHistory: admin.loginHistory
    };

    sendSuccess(res, adminData, "Admin profile retrieved");

  } catch (error) {
    console.error("Get admin profile error:", error);
    sendError(res, "Failed to retrieve profile", 500);
  }
};

/**
 * Admin Logout
 */
export const adminLogout = async (req, res) => {
  try {
    sendSuccess(res, null, "Admin logged out successfully");
  } catch (error) {
    sendError(res, "Logout failed", 500);
  }
};

/**
 * Admin Registration - Only existing admins can register new admins
 * ✅ Protected by adminAuth middleware
 * ✅ Validates all required fields
 * ✅ Checks email uniqueness
 * ✅ Hashes password before storing
 */
export const adminRegister = async (req, res) => {
  try {
    const { email, password, name, adminCode, permissions } = req.body;
    const createdBy = req.user._id; // Admin doing the registration

    // Validate input
    const validationErrors = validateAdminRegistrationInput(req.body);
    if (validationErrors.length > 0) {
      return sendError(res, validationErrors.join(", "), 400);
    }

    // Check if admin email already exists
    const existingAdmin = await Admin.findByEmail(email);
    if (existingAdmin) {
      return sendError(res, "Admin with this email already exists", 409);
    }

    // Check if adminCode already exists
    const existingCode = await Admin.findByCode(adminCode);
    if (existingCode) {
      return sendError(res, "Admin code already exists", 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const newAdmin = await Admin.create({
      email,
      password: hashedPassword,
      name,
      adminCode,
      permissions,
      isActive: true,
      role: "ADMIN",
      createdBy
    });

    // Remove password from response
    const adminData = {
      _id: newAdmin._id,
      adminCode: newAdmin.adminCode,
      name: newAdmin.name,
      email: newAdmin.email,
      permissions: newAdmin.permissions,
      isActive: newAdmin.isActive,
      createdAt: newAdmin.createdAt
    };

    // Log the registration
    console.log(`[ADMIN REGISTRATION] New admin registered: ${email} by admin: ${req.user.email}`);

    sendSuccess(res, adminData, "Admin registered successfully", 201);

  } catch (error) {
    console.error("Admin registration error:", error);
    sendError(res, "Admin registration failed", 500);
  }
};
