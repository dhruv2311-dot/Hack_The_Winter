import express from "express";
import {
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
} from "../../controllers/admin/HospitalBloodRequestController.js";

const router = express.Router();

// ============= HOSPITAL ROUTES =============
// These routes are for hospitals

// Create new blood request
router.post("/create", createRequest);

// Get all requests (with filters)
router.get("/all", getAllRequests);

// Get urgent/critical requests
router.get("/urgent", getUrgentRequests);

// Get request by ID
router.get("/id/:id", getRequestById);

// Get request with full details (includes hospital and blood bank info)
router.get("/details/:id", getRequestWithDetails);

// Get requests by hospital
router.get("/hospital/:hospitalId", getRequestsByHospital);

// Cancel request
router.post("/:id/cancel", cancelRequest);

// Add communication log
router.post("/:id/communication", addCommunicationLog);

// ============= BLOOD BANK ROUTES =============
// These routes are for blood banks

// Get requests by blood bank
router.get("/bloodbank/:bloodBankId", getRequestsByBloodBank);

// Blood bank responds to request
router.post("/:id/respond", updateResponse);

// Start processing request
router.post("/:id/process", startProcessing);

// Fulfill request (completes the request and updates blood stock)
router.post("/:id/fulfill", fulfillRequest);

// Reject request
router.post("/:id/reject", rejectRequest);

// ============= ADMIN/SYSTEM ROUTES =============
// These routes require admin authentication or are for system operations

// Assign blood bank to request
router.post("/:id/assign", assignBloodBank);

// Admin approves critical/emergency request
router.post("/approve", approveRequest);

// Get request statistics
router.get("/stats/requests", getRequestStatistics);

// Get average response time
router.get("/stats/response-time", getAverageResponseTime);

// Delete request (admin only)
router.delete("/:id", deleteRequest);

// ============= ROUND 2: PRIORITY SYSTEM ROUTES =============

// Get priority queue (all pending requests sorted by priority)
router.get("/queue/priority", getPriorityQueue);

// Get requests by priority category (CRITICAL, HIGH, MEDIUM, LOW)
router.get("/priority/category", getByPriorityCategory);

// Get priority dashboard statistics
router.get("/priority/dashboard", getPriorityDashboard);

// Get priority system configuration and validation
router.get("/priority/config", getPriorityConfiguration);

// Recalculate priority for specific request
router.post("/:id/priority/recalculate", recalculatePriority);

// Batch recalculate all priorities (admin only)
router.post("/priority/batch-recalculate", batchRecalculatePriorities);

export default router;
