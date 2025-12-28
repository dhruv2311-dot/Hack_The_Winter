import { Approval } from "../../models/admin/Approval.js";

// ============= VALIDATORS =============

const validateApprovalQuery = (query) => {
  const errors = [];
  const validTypes = ["hospital", "bloodbank", "ngo"];
  
  if (!query.type || !validTypes.includes(query.type.toLowerCase())) {
    errors.push(`Type must be one of: ${validTypes.join(", ")}`);
  }
  
  return errors;
};

const validateApprovalAction = (data, action) => {
  const errors = [];
  
  if (!data.organizationCode) errors.push("Organization code is required");
  
  if (action === "approve") {
    if (!data.approvalRemarks) errors.push("Approval remarks are required");
  } else if (action === "reject") {
    if (!data.rejectionReason) errors.push("Rejection reason is required");
  } else if (action === "suspend") {
    if (!data.suspensionReason) errors.push("Suspension reason is required");
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

// ============= APPROVAL WORKFLOW FUNCTIONS =============

/**
 * Get ALL Pending Approvals (All types combined)
 * No type filter required
 * Pagination: page, limit
 */
export const getAllPendingApprovals = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = "createdAt" } = req.query;
    
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    // Get all pending organizations using Approval model
    const result = await Approval.getPendingAll(
      { sortBy },
      { page: pageNum, limit: limitNum }
    );

    // Format response with type breakdown
    const formatted = result.organizations.map(org => ({
      _id: org._id,
      organizationCode: org.organizationCode,
      registrationCode: org.registrationCode,
      name: org.name,
      type: org.type,
      email: org.email,
      phone: org.phone,
      location: org.location,
      licenseNumber: org.licenseNumber,
      contactPerson: org.contactPerson,
      adminEmail: org.adminEmail,
      requestedAt: org.createdAt
    }));

    // Count breakdown by type
    const typeBreakdown = {
      hospital: formatted.filter(org => org.type === "hospital").length,
      bloodbank: formatted.filter(org => org.type === "bloodbank").length,
      ngo: formatted.filter(org => org.type === "ngo").length
    };

    sendSuccess(res, {
      organizations: formatted,
      typeBreakdown,
      pagination: result.pagination
    }, `Found ${result.pagination.totalItems} total pending approvals`);

  } catch (error) {
    console.error("Get all pending approvals error:", error);
    sendError(res, "Failed to fetch pending approvals", 500);
  }
};

/**
 * Get Pending Approvals by Type
 * Filters: type (hospital, bloodbank, ngo), page, limit
 */
export const getPendingApprovals = async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;
    
    // Validate query parameters
    const validationErrors = validateApprovalQuery(req.query);
    if (validationErrors.length > 0) {
      return sendError(res, validationErrors.join(", "), 400);
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    // Get pending organizations using Approval model
    const result = await Approval.getPendingByType(type.toLowerCase(), {
      page: pageNum,
      limit: limitNum
    });

    // Format response
    const formatted = result.organizations.map(org => ({
      _id: org._id,
      organizationCode: org.organizationCode,
      registrationCode: org.registrationCode,
      name: org.name,
      type: org.type,
      email: org.email,
      phone: org.phone,
      location: org.location,
      licenseNumber: org.licenseNumber,
      contactPerson: org.contactPerson,
      adminEmail: org.adminEmail,
      requestedAt: org.createdAt
    }));

    sendSuccess(res, {
      organizations: formatted,
      pagination: result.pagination
    }, `Found ${result.pagination.totalItems} pending ${type} approvals`);

  } catch (error) {
    console.error("Get pending approvals error:", error);
    sendError(res, "Failed to fetch pending approvals", 500);
  }
};

/**
 * Get Pending Hospitals Only
 */
export const getPendingHospitals = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    const result = await Approval.getPendingByType("hospital", {
      page: pageNum,
      limit: limitNum
    });

    const formatted = result.organizations.map(hospital => ({
      _id: hospital._id,
      organizationCode: hospital.organizationCode,
      registrationCode: hospital.registrationCode,
      name: hospital.name,
      type: hospital.type,
      status: hospital.status,
      licenseNumber: hospital.licenseNumber,
      location: hospital.location,
      email: hospital.email,
      phone: hospital.phone,
      contactPerson: hospital.contactPerson,
      adminName: hospital.adminName,
      adminEmail: hospital.adminEmail,
      requestedAt: hospital.createdAt
    }));

    sendSuccess(res, {
      hospitals: formatted,
      pagination: result.pagination
    }, `${result.pagination.totalItems} hospitals pending approval`);

  } catch (error) {
    console.error("Get pending hospitals error:", error);
    sendError(res, "Failed to fetch pending hospitals", 500);
  }
};

/**
 * Get Pending Blood Banks Only
 */
export const getPendingBloodBanks = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    const result = await Approval.getPendingByType("bloodbank", {
      page: pageNum,
      limit: limitNum
    });

    const formatted = result.organizations.map(bank => ({
      _id: bank._id,
      organizationCode: bank.organizationCode,
      registrationCode: bank.registrationCode,
      name: bank.name,
      type: bank.type,
      status: bank.status,
      licenseNumber: bank.licenseNumber,
      location: bank.location,
      email: bank.email,
      phone: bank.phone,
      director: bank.contactPerson,
      requestedAt: bank.createdAt
    }));

    sendSuccess(res, {
      bloodBanks: formatted,
      pagination: result.pagination
    }, `${result.pagination.totalItems} blood banks pending approval`);

  } catch (error) {
    console.error("Get pending blood banks error:", error);
    sendError(res, "Failed to fetch pending blood banks", 500);
  }
};

/**
 * Get Pending NGOs Only
 */
export const getPendingNgos = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    const result = await Approval.getPendingByType("ngo", {
      page: pageNum,
      limit: limitNum
    });

    const formatted = result.organizations.map(ngo => ({
      _id: ngo._id,
      organizationCode: ngo.organizationCode,
      registrationCode: ngo.registrationCode,
      name: ngo.name,
      type: ngo.type,
      status: ngo.status,
      licenseNumber: ngo.licenseNumber,
      location: ngo.location,
      email: ngo.email,
      phone: ngo.phone,
      contactPerson: ngo.contactPerson,
      requestedAt: ngo.createdAt
    }));

    sendSuccess(res, {
      ngos: formatted,
      pagination: result.pagination
    }, `${result.pagination.totalItems} NGOs pending approval`);

  } catch (error) {
    console.error("Get pending NGOs error:", error);
    sendError(res, "Failed to fetch pending NGOs", 500);
  }
};

/**
 * Get Approval Statistics
 */
export const getApprovalStats = async (req, res) => {
  try {
    const stats = await Approval.getStats();

    const summary = {
      totalPending: 0,
      pending: {
        hospitals: 0,
        bloodBanks: 0,
        ngos: 0
      },
      approvedCount: {
        hospitals: 0,
        bloodBanks: 0,
        ngos: 0
      },
      rejectedCount: {
        hospitals: 0,
        bloodBanks: 0,
        ngos: 0
      },
      suspendedCount: {
        hospitals: 0,
        bloodBanks: 0,
        ngos: 0
      }
    };

    // Process stats from aggregation
    stats.forEach(stat => {
      const typeKey = stat._id === "hospital" ? "hospitals" : 
                      stat._id === "bloodbank" ? "bloodBanks" : "ngos";
      
      summary.pending[typeKey] = stat.pending;
      summary.approvedCount[typeKey] = stat.approved;
      summary.rejectedCount[typeKey] = stat.rejected;
      summary.suspendedCount[typeKey] = stat.suspended;
      summary.totalPending += stat.pending;
    });

    sendSuccess(res, summary, "Approval statistics retrieved");

  } catch (error) {
    console.error("Get approval stats error:", error);
    sendError(res, "Failed to fetch approval statistics", 500);
  }
};

/**
 * Get Organization Details by Code
 */
export const getOrganizationDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const org = await Approval.getByCode(id);
    if (!org) {
      return sendError(res, "Organization not found", 404);
    }

    const details = {
      _id: org._id,
      organizationCode: org.organizationCode,
      registrationCode: org.registrationCode,
      name: org.name,
      type: org.type,
      status: org.status,
      email: org.email,
      phone: org.phone,
      location: org.location,
      licenseNumber: org.licenseNumber,
      contactPerson: org.contactPerson,
      adminName: org.adminName,
      adminEmail: org.adminEmail,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt
    };

    sendSuccess(res, details, "Organization details retrieved");

  } catch (error) {
    console.error("Get organization details error:", error);
    sendError(res, "Failed to fetch organization details", 500);
  }
};

// ============= APPROVAL ACTIONS =============

/**
 * APPROVE Organization
 * - Removes adminPassword from organization document
 * - Creates new organization admin user with default password "admin123"
 * - Sets organization status to APPROVED
 */
export const approveOrganization = async (req, res) => {
  try {
    const { organizationCode, approvalRemarks } = req.body;

    console.log(`\n[APPROVE REQUEST] organizationCode: ${organizationCode}`);

    // Validate input
    const validationErrors = validateApprovalAction(req.body, "approve");
    if (validationErrors.length > 0) {
      console.warn(`[VALIDATION ERROR] ${validationErrors.join(", ")}`);
      return sendError(res, validationErrors.join(", "), 400);
    }

    // Check if organization exists and is pending
    const org = await Approval.getByCode(organizationCode);
    if (!org) {
      console.warn(`[NOT FOUND] Organization code: ${organizationCode}`);
      return sendError(res, "Organization not found", 404);
    }

    if (org.status !== "PENDING") {
      console.warn(`[INVALID STATUS] ${organizationCode} status is ${org.status}`);
      return sendError(res, `Organization is ${org.status}, cannot approve`, 400);
    }

    console.log(`[STATUS] ${organizationCode} is PENDING - proceeding with approval`);

    // Prepare admin data
    const adminData = {
      name: org.adminName,
      email: org.adminEmail,
      role: "ORGANIZATION_ADMIN"
    };

    // Approve using model
    // This will:
    // 1. Remove adminPassword from organization
    // 2. Create new organization admin user with password "admin123"
    // 3. Set status to APPROVED
    const updated = await Approval.approve(organizationCode, adminData, approvalRemarks);

    // Check if approval was successful
    if (!updated) {
      console.error(`[ERROR] Failed to update organization ${organizationCode} - No response from database`);
      return sendError(res, "Failed to update organization status - no response from database", 500);
    }

    console.log(`[SUCCESS] ${organizationCode} approved successfully`);
    console.log(`[SUCCESS] Organization admin created for: ${org.adminEmail}`);
    console.log(`[APPROVAL COMPLETE]\n`);

    sendSuccess(res, {
      organizationCode: updated.organizationCode,
      name: updated.name,
      status: updated.status,
      approvedAt: updated.approvedAt,
      adminEmail: updated.adminEmail,
      organizationAdmin: updated.organizationAdmin,
      message: "Organization approved successfully. Organization admin user created with password 'admin123'"
    }, "Organization approved successfully", 200);

  } catch (error) {
    console.error(`[ERROR] Approve organization error:`, error.message);
    console.error(`[STACK]`, error.stack);
    sendError(res, `Failed to approve organization: ${error.message}`, 500);
  }
};

/**
 * REJECT Organization
 */
export const rejectOrganization = async (req, res) => {
  try {
    const { organizationCode, rejectionReason } = req.body;

    // Validate input
    const validationErrors = validateApprovalAction(req.body, "reject");
    if (validationErrors.length > 0) {
      return sendError(res, validationErrors.join(", "), 400);
    }

    // Check if organization exists and is pending
    const org = await Approval.getByCode(organizationCode);
    if (!org) {
      return sendError(res, "Organization not found", 404);
    }

    if (org.status !== "PENDING") {
      return sendError(res, `Organization is ${org.status}, cannot reject`, 400);
    }

    // Reject using model
    const updated = await Approval.reject(organizationCode, rejectionReason);

    // Check if rejection was successful
    if (!updated) {
      return sendError(res, "Failed to update organization status", 500);
    }

    console.log(`[REJECTION] ${organizationCode} rejected. Reason: ${rejectionReason}`);

    sendSuccess(res, {
      organizationCode: updated.organizationCode,
      name: updated.name,
      status: updated.status,
      rejectionReason: updated.rejectionReason,
      message: "Organization rejected"
    }, "Organization rejected successfully", 200);

  } catch (error) {
    console.error("Reject organization error:", error);
    sendError(res, "Failed to reject organization", 500);
  }
};

/**
 * SUSPEND Organization
 */
export const suspendOrganization = async (req, res) => {
  try {
    const { organizationCode, suspensionReason } = req.body;

    // Validate input
    const validationErrors = validateApprovalAction(req.body, "suspend");
    if (validationErrors.length > 0) {
      return sendError(res, validationErrors.join(", "), 400);
    }

    // Check if organization exists
    const org = await Approval.getByCode(organizationCode);
    if (!org) {
      return sendError(res, "Organization not found", 404);
    }

    // Suspend using model
    const updated = await Approval.suspend(organizationCode, suspensionReason);

    // Check if suspension was successful
    if (!updated) {
      return sendError(res, "Failed to update organization status", 500);
    }

    console.log(`[SUSPENSION] ${organizationCode} suspended. Reason: ${suspensionReason}`);

    sendSuccess(res, {
      organizationCode: updated.organizationCode,
      name: updated.name,
      status: updated.status,
      suspensionReason: updated.suspensionReason,
      message: "Organization suspended"
    }, "Organization suspended successfully", 200);

  } catch (error) {
    console.error("Suspend organization error:", error);
    sendError(res, "Failed to suspend organization", 500);
  }
};

