import express from "express";
import {
    createRequest,
    getNgoRequests,
    getAllRequests,
    updateRequestStatus
} from "../../controllers/NGO/CampResourceRequestController.js";
import authMiddleware from "../../middleware/auth.middleware.js";

const router = express.Router();

// NGO Routes: Create and List their own requests
router.post("/", authMiddleware, createRequest);
router.get("/ngo", authMiddleware, getNgoRequests);

// Blood Bank Routes (Ideally should check 'role' in middleware)
router.get("/all", authMiddleware, getAllRequests);
router.put("/:id/status", authMiddleware, updateRequestStatus);

export default router;
