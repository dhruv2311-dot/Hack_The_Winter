import express from "express";
import {
  getAvailableCampsWithSlots,
  getCampSlots
} from "../controllers/CampController.js";

const router = express.Router();

// Get all available camps with their available slots
router.get("/available-camps", getAvailableCampsWithSlots);

// Get slots for a specific camp
router.get("/:campId/slots", getCampSlots);

export default router;
