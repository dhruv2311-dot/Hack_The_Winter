import express from "express";
import { SyncController } from "../controllers/SyncController.js";

const router = express.Router();

/**
 * Sync Routes - Create hospital documents from organizations
 */

// Create hospital document for specific organization
router.post("/create-hospital/:organizationId", SyncController.createHospitalFromOrganization);

// Sync all hospital-type organizations
router.post("/sync-all-hospitals", SyncController.syncAllHospitals);

export default router;
