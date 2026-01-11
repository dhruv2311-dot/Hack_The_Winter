import HospitalBloodRequest from "../../models/admin/HospitalBloodRequest.js";
import BloodBank from "../../models/admin/BloodBank.js";
import PriorityRequestHandler from "../../services/PriorityRequestHandler.js";

/**
 * HospitalBloodRequestController
 * Handles emergency blood requests from hospitals to blood banks
 */

// ============= CREATE REQUEST =============
export const createRequest = async (req, res) => {
  try {
    // Get current blood availability
    const availability = await PriorityRequestHandler.getBloodAvailability(req.body.bloodGroup);

    // Enrich request data with priority calculation
    const enrichedData = await PriorityRequestHandler.enrichRequestWithPriority(
      req.body,
      availability
    );

    // Create request with priority
    const request = await HospitalBloodRequest.create(enrichedData);

    const message = request.urgency === "CRITICAL"
      ? `🚨 Emergency blood request created with ${request.priorityCategory} priority. Waiting for admin approval.`
      : `✅ Blood request created successfully with ${request.priorityCategory} priority.`;

    return res.status(201).json({
      success: true,
      message,
      data: {
        ...request,
        priority: PriorityRequestHandler.formatPriorityForResponse(request)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating request",
      error: error.message
    });
  }
};

// ============= GET ALL REQUESTS =============
export const getAllRequests = async (req, res) => {
  try {
    const { status, urgency, bloodGroup, page = 1, limit = 20 } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (urgency) filters.urgency = urgency;
    if (bloodGroup) filters.bloodGroup = bloodGroup;

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await HospitalBloodRequest.findPendingRequests(filters, pagination);

    return res.status(200).json({
      success: true,
      message: "Requests retrieved successfully",
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving requests",
      error: error.message
    });
  }
};

// ============= GET URGENT REQUESTS =============
export const getUrgentRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await HospitalBloodRequest.findUrgentRequests(pagination);

    return res.status(200).json({
      success: true,
      message: "Urgent requests retrieved successfully",
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving urgent requests",
      error: error.message
    });
  }
};

// ============= GET REQUEST BY ID =============
export const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await HospitalBloodRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Request retrieved successfully",
      data: request
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving request",
      error: error.message
    });
  }
};

// ============= GET REQUEST WITH DETAILS =============
export const getRequestWithDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await HospitalBloodRequest.getRequestWithDetails(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Request details retrieved successfully",
      data: request
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving request details",
      error: error.message
    });
  }
};

// ============= GET REQUESTS BY HOSPITAL =============
export const getRequestsByHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { status, urgency, bloodGroup, page = 1, limit = 20 } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (urgency) filters.urgency = urgency;
    if (bloodGroup) filters.bloodGroup = bloodGroup;

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await HospitalBloodRequest.findByHospitalId(hospitalId, filters, pagination);

    return res.status(200).json({
      success: true,
      message: "Hospital requests retrieved successfully",
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving requests",
      error: error.message
    });
  }
};

// ============= GET REQUESTS BY BLOOD BANK =============
export const getRequestsByBloodBank = async (req, res) => {
  try {
    let { bloodBankId } = req.params;
    const { status, urgency, bloodGroup, page = 1, limit = 20 } = req.query;

    // Auto-scope by user role and organization
    const userRole = req.user?.role || req.admin?.role;
    const userOrgId = req.organization?.id || req.user?.organizationId;
    const userOrgType = req.organization?.type || req.user?.organizationType;

    // If user is blood bank staff, override to their organization
    if ((userRole === 'BLOOD_BANK_STAFF' || userOrgType === 'bloodbank') && userOrgId) {
      bloodBankId = userOrgId;
    }

    const filters = {};
    if (status) filters.status = status;
    if (urgency) filters.urgency = urgency;
    if (bloodGroup) filters.bloodGroup = bloodGroup;

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await HospitalBloodRequest.findByBloodBankId(bloodBankId, filters, pagination);

    return res.status(200).json({
      success: true,
      message: "Blood bank requests retrieved successfully",
      data: result,
      userRole,
      scoped: userRole === 'BLOOD_BANK_STAFF' || userOrgType === 'bloodbank'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving requests",
      error: error.message
    });
  }
};

// ============= ADMIN: APPROVE CRITICAL REQUEST =============
export const approveRequest = async (req, res) => {
  try {
    const { requestId, remarks } = req.body;
    const adminId = req.admin?._id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required"
      });
    }

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: "Request ID is required"
      });
    }

    const success = await HospitalBloodRequest.approveByAdmin(requestId, adminId, remarks);

    if (!success) {
      return res.status(400).json({
        success: false,
        message: "Approval failed. Request must require admin approval."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Request approved successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error approving request",
      error: error.message
    });
  }
};

// ============= ASSIGN BLOOD BANK =============
export const assignBloodBank = async (req, res) => {
  try {
    const { id } = req.params;
    const { bloodBankId } = req.body;

    if (!bloodBankId) {
      return res.status(400).json({
        success: false,
        message: "Blood bank ID is required"
      });
    }

    const success = await HospitalBloodRequest.assignBloodBank(id, bloodBankId);

    if (!success) {
      return res.status(400).json({
        success: false,
        message: "Failed to assign blood bank. Request must be in PENDING status."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blood bank assigned successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error assigning blood bank",
      error: error.message
    });
  }
};

// ============= BLOOD BANK RESPONSE =============
export const updateResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const responseData = req.body;

    const success = await HospitalBloodRequest.updateBloodBankResponse(id, responseData);

    if (!success) {
      return res.status(400).json({
        success: false,
        message: "Failed to update response"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Response recorded successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating response",
      error: error.message
    });
  }
};

// ============= START PROCESSING =============
export const startProcessing = async (req, res) => {
  try {
    const { id } = req.params;
    const { staffId } = req.body;

    const success = await HospitalBloodRequest.startProcessing(id, staffId);

    if (!success) {
      return res.status(400).json({
        success: false,
        message: "Cannot start processing. Request must be in APPROVED status."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Request processing started successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error starting processing",
      error: error.message
    });
  }
};

// ============= FULFILL REQUEST =============
export const fulfillRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { unitsFulfilled, batchNumbers, expiryDates, collectionMethod } = req.body;

    if (!unitsFulfilled) {
      return res.status(400).json({
        success: false,
        message: "Units fulfilled is required"
      });
    }

    // Fulfill the request
    const success = await HospitalBloodRequest.fulfillRequest(id, {
      unitsFulfilled: parseInt(unitsFulfilled),
      batchNumbers: batchNumbers || [],
      expiryDates: expiryDates || [],
      collectionMethod: collectionMethod || "PICKUP",
      actualDeliveryTime: new Date()
    });

    if (!success) {
      return res.status(400).json({
        success: false,
        message: "Cannot fulfill request. Must be in PROCESSING status."
      });
    }

    // Update blood bank stock and statistics
    const request = await HospitalBloodRequest.findById(id);
    if (request && request.bloodBankId) {
      // Reduce blood stock
      await BloodBank.updateBloodStock(
        request.bloodBankId,
        request.bloodGroup,
        -parseInt(unitsFulfilled)
      );

      // Update statistics
      await BloodBank.incrementStatistics(
        request.bloodBankId,
        "totalHospitalRequestsFulfilled",
        1
      );
      await BloodBank.incrementStatistics(
        request.bloodBankId,
        "totalUnitsDistributed",
        parseInt(unitsFulfilled)
      );
    }

    return res.status(200).json({
      success: true,
      message: "Request fulfilled successfully and blood stock updated"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fulfilling request",
      error: error.message
    });
  }
};

// ============= REJECT REQUEST =============
export const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason, rejectedBy } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required"
      });
    }

    const success = await HospitalBloodRequest.rejectRequest(id, rejectionReason, rejectedBy);

    if (!success) {
      return res.status(400).json({
        success: false,
        message: "Failed to reject request"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Request rejected successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error rejecting request",
      error: error.message
    });
  }
};

// ============= CANCEL REQUEST =============
export const cancelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    if (!cancellationReason) {
      return res.status(400).json({
        success: false,
        message: "Cancellation reason is required"
      });
    }

    const success = await HospitalBloodRequest.cancelRequest(id, cancellationReason);

    if (!success) {
      return res.status(400).json({
        success: false,
        message: "Failed to cancel request"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Request cancelled successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error cancelling request",
      error: error.message
    });
  }
};

// ============= ADD COMMUNICATION LOG =============
export const addCommunicationLog = async (req, res) => {
  try {
    const { id } = req.params;
    const logEntry = req.body;

    if (!logEntry.message) {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }

    const success = await HospitalBloodRequest.addCommunicationLog(id, logEntry);

    if (!success) {
      return res.status(400).json({
        success: false,
        message: "Failed to add communication log"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Communication log added successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error adding communication log",
      error: error.message
    });
  }
};

// ============= GET REQUEST STATISTICS =============
export const getRequestStatistics = async (req, res) => {
  try {
    const { hospitalId, bloodBankId } = req.query;

    const stats = await HospitalBloodRequest.getRequestStatistics(hospitalId, bloodBankId);

    return res.status(200).json({
      success: true,
      message: "Request statistics retrieved successfully",
      data: stats
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving statistics",
      error: error.message
    });
  }
};

// ============= GET AVERAGE RESPONSE TIME =============
export const getAverageResponseTime = async (req, res) => {
  try {
    const { bloodBankId } = req.query;

    const result = await HospitalBloodRequest.getAverageResponseTime(bloodBankId);

    return res.status(200).json({
      success: true,
      message: "Average response time retrieved successfully",
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving response time",
      error: error.message
    });
  }
};

// ============= DELETE REQUEST =============
export const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin?._id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required"
      });
    }

    const success = await HospitalBloodRequest.deleteById(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Request deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting request",
      error: error.message
    });
  }
};

// ============= ROUND 2: PRIORITY SYSTEM ENDPOINTS =============

/**
 * Get priority queue - all pending requests sorted by priority
 * Auto-scoped by user role:
 * - Super Admin: See all requests
 * - Blood Bank: See requests assigned to their organization
 * - Hospital: See only their hospital's requests
 * Also includes organization details for request source and destination
 */
export const getPriorityQueue = async (req, res) => {
  try {
    const { limit = 50, bloodGroup } = req.query;
    const userRole = req.user?.role || req.admin?.role;
    const userOrgId = req.organization?.id || req.user?.organizationId;
    const userOrgType = req.organization?.type || req.user?.organizationType;

    const filters = {};
    if (bloodGroup) filters.bloodGroup = bloodGroup;

    // Auto-scope based on user role
    if (userRole === 'SUPER_ADMIN' || userRole === 'Admin') {
      // Super Admin sees all requests - no organization filter
    } else if (userRole === 'BLOOD_BANK_STAFF' || userOrgType === 'bloodbank') {
      // Blood bank sees only requests assigned to them
      filters.bloodBankId = userOrgId;
    } else if (userRole === 'HOSPITAL_STAFF' || userOrgType === 'hospital') {
      // Hospital sees only their own requests
      filters.hospitalId = userOrgId;
    } else if (userRole === 'NGO_STAFF' || userOrgType === 'ngo') {
      // NGO sees their own requests/drives
      filters.ngoId = userOrgId;
    }

    const queue = await PriorityRequestHandler.getPriorityQueueWithOrgInfo(filters, parseInt(limit));

    return res.status(200).json({
      success: true,
      message: "Priority queue retrieved successfully",
      data: {
        totalInQueue: queue.length,
        userRole: userRole,
        scoped: userRole !== 'SUPER_ADMIN' && userRole !== 'Admin',
        queue: queue,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving priority queue",
      error: error.message
    });
  }
};

/**
 * Get requests by priority category
 * Allows filtering for specific urgency levels (CRITICAL, HIGH, etc)
 */
export const getByPriorityCategory = async (req, res) => {
  try {
    const { category, limit = 50 } = req.query;

    if (!category || !["CRITICAL", "HIGH", "MEDIUM", "LOW"].includes(category.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: "Valid priority category required: CRITICAL, HIGH, MEDIUM, or LOW"
      });
    }

    const requests = await HospitalBloodRequest.getByPriorityCategory(
      category.toUpperCase(),
      parseInt(limit)
    );

    return res.status(200).json({
      success: true,
      message: `Requests with ${category} priority retrieved successfully`,
      data: {
        category: category.toUpperCase(),
        count: requests.length,
        requests: requests.map(req => ({
          _id: req._id,
          requestCode: req.requestCode,
          hospitalId: req.hospitalId,
          bloodGroup: req.bloodGroup,
          unitsRequired: req.unitsRequired,
          urgency: req.urgency,
          priority: PriorityRequestHandler.formatPriorityForResponse(req),
          createdAt: req.createdAt,
          status: req.status
        }))
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving requests by priority category",
      error: error.message
    });
  }
};

/**
 * Recalculate priority for a specific request
 * Called when blood availability changes significantly
 */
export const recalculatePriority = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the request
    const request = await HospitalBloodRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    // Get current blood availability
    const availability = await PriorityRequestHandler.getBloodAvailability(request.bloodGroup);

    // Recalculate and update priority
    const result = await PriorityRequestHandler.recalculateAndUpdatePriority(
      id,
      request,
      availability
    );

    if (!result) {
      return res.status(500).json({
        success: false,
        message: "Failed to recalculate priority"
      });
    }

    // Get updated request
    const updatedRequest = await HospitalBloodRequest.findById(id);

    return res.status(200).json({
      success: true,
      message: "Priority recalculated successfully",
      data: {
        oldPriority: {
          score: request.priorityScore,
          category: request.priorityCategory
        },
        newPriority: result,
        request: {
          _id: updatedRequest._id,
          requestCode: updatedRequest.requestCode,
          priority: PriorityRequestHandler.formatPriorityForResponse(updatedRequest)
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error recalculating priority",
      error: error.message
    });
  }
};

/**
 * Get priority dashboard statistics
 * Shows overview of all requests by priority category
 */
export const getPriorityDashboard = async (req, res) => {
  try {
    const stats = await PriorityRequestHandler.getPriorityDashboardStats();

    return res.status(200).json({
      success: true,
      message: "Priority dashboard statistics retrieved successfully",
      data: stats,
      timestamp: new Date()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving priority dashboard",
      error: error.message
    });
  }
};

/**
 * Batch recalculate all priorities
 * Usually called on a schedule or when blood stock changes significantly
 * Admin only endpoint
 */
export const batchRecalculatePriorities = async (req, res) => {
  try {
    const adminId = req.admin?._id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required"
      });
    }

    const result = await PriorityRequestHandler.batchRecalculatePriorities();

    return res.status(200).json({
      success: true,
      message: "Batch priority recalculation completed",
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in batch priority recalculation",
      error: error.message
    });
  }
};

/**
 * Get priority system validation info
 * Shows weights, valid urgencies, and configuration
 */
export const getPriorityConfiguration = async (req, res) => {
  try {
    const validation = PriorityRequestHandler.validateConfiguration();

    return res.status(200).json({
      success: true,
      message: "Priority system configuration retrieved",
      data: {
        isValid: validation.isValid,
        weights: validation.weights,
        totalWeight: validation.totalWeight,
        validUrgencies: validation.validUrgencies,
        validBloodGroups: validation.validBloodGroups,
        error: validation.error || null
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving priority configuration",
      error: error.message
    });
  }
};

export default {
  createRequest,
  getAllRequests,
  getUrgentRequests,
  getRequestById,
  getRequestWithDetails,
  getRequestsByHospital,
  getRequestsByBloodBank,
  approveRequest,
  assignBloodBank,
  updateResponse,
  startProcessing,
  fulfillRequest,
  rejectRequest,
  cancelRequest,
  addCommunicationLog,
  getRequestStatistics,
  getAverageResponseTime,
  deleteRequest,
  // Priority system endpoints
  getPriorityQueue,
  getByPriorityCategory,
  recalculatePriority,
  getPriorityDashboard,
  batchRecalculatePriorities,
  getPriorityConfiguration
};
