import User from "../../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ============= VALIDATORS =============

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  const errors = [];
  if (password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }
  return errors;
};

const validateRegisterInput = (data) => {
  const errors = [];
  if (!data.name || data.name.trim().length < 3) {
    errors.push("Name must be at least 3 characters");
  }
  if (!data.email || !validateEmail(data.email)) {
    errors.push("Invalid email format");
  }
  if (!data.password) {
    errors.push("Password is required");
  } else {
    const passwordErrors = validatePassword(data.password);
    errors.push(...passwordErrors);
  }
  if (!data.role) {
    errors.push("Role is required");
  }
  return errors;
};

const validateLoginInput = (data) => {
  const errors = [];
  if (!data.email || !validateEmail(data.email)) {
    errors.push("Invalid email format");
  }
  if (!data.password) {
    errors.push("Password is required");
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

const sendValidationError = (res, errors = []) => {
  res.status(400).json({
    success: false,
    message: "Validation failed",
    errors
  });
};

// ============= CONTROLLERS =============

/**
 * REGISTER - Create new user account
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    const validationErrors = validateRegisterInput(req.body);
    if (validationErrors.length > 0) {
      return sendValidationError(res, validationErrors);
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return sendError(res, "User already exists", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    // Return success (without password)
    const userData = { ...newUser };
    delete userData.password;

    sendSuccess(res, userData, "Registration successful", 201);
  } catch (error) {
    console.error("Registration error:", error);
    sendError(res, "Registration failed", 500);
  }
};

/**
 * LOGIN - Authenticate user
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    const validationErrors = validateLoginInput(req.body);
    if (validationErrors.length > 0) {
      return sendValidationError(res, validationErrors);
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return sendError(res, "Invalid credentials", 401);
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, "Invalid credentials", 401);
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role, email: user.email },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "24h" }
    );

    // Return user data without password
    const userData = { ...user };
    delete userData.password;

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: userData
    });
  } catch (error) {
    console.error("Login error:", error);
    sendError(res, "Login failed", 500);
  }
};
