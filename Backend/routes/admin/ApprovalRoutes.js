import express from "express";
import {
  getAllPendingApprovals,
  getPendingApprovals,
  getPendingHospitals,
  getPendingBloodBanks,
  getPendingNgos,
  getApprovalStats,
  getOrganizationDetails,
  approveOrganization,
  rejectOrganization,
  suspendOrganization
} from "../../controllers/admin/ApprovalController.js";

import adminAuthMiddleware from "../../middleware/adminAuth.middleware.js";

const router = express.Router();

// ============= VIEW ROUTES (Admin Only) =============

// Get ALL pending approvals (all types combined)
router.get("/pending/all", adminAuthMiddleware, getAllPendingApprovals);

// Get pending approvals by type (hospital, bloodbank, ngo)
router.get("/pending", adminAuthMiddleware, getPendingApprovals);

// Get pending hospitals only
router.get("/pending/hospitals", adminAuthMiddleware, getPendingHospitals);

// Get pending blood banks only
router.get("/pending/bloodbanks", adminAuthMiddleware, getPendingBloodBanks);

// Get pending NGOs only
router.get("/pending/ngos", adminAuthMiddleware, getPendingNgos);

// Get approval statistics summary
router.get("/stats", adminAuthMiddleware, getApprovalStats);

// Get organization details by code (for verification before approval)
router.get("/:id", adminAuthMiddleware, getOrganizationDetails);

// ============= ACTION ROUTES (Admin Only) =============

/**
 * POST /api/admin/approvals/approve
 * Approve a pending organization
 * Body: { organizationCode, approvalRemarks }
 */
router.post("/approve", adminAuthMiddleware, approveOrganization);

/**
 * POST /api/admin/approvals/reject
 * Reject a pending organization
 * Body: { organizationCode, rejectionReason }
 */
router.post("/reject", adminAuthMiddleware, rejectOrganization);

/**
 * POST /api/admin/approvals/suspend
 * Suspend an organization
 * Body: { organizationCode, suspensionReason }
 */
router.post("/suspend", adminAuthMiddleware, suspendOrganization);

export default router;
