import express from "express";
import {
  createCamp,
  getMyCamps,
  createSlot,
  getCampSlots,
  registerDonorToSlot
} from "../controllers/NgoController.js";

import auth from "../middleware/auth.middleware.js";
import role from "../middleware/role.middleware.js";

const router = express.Router();

router.use(auth);

router.post("/camp", role("ngo"), createCamp);
router.get("/camp", role("ngo"), getMyCamps);

router.post("/slot", role("ngo"), createSlot);
router.get("/camp/:campId/slots", getCampSlots);

router.post("/camp/register", role("user"), registerDonorToSlot);

export default router;
