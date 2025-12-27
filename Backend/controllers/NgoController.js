// import NgoCamp from "../models/NgoCamp.js";
// import CampSlot from "../models/CampSlot.js";
// import CampRegistration from "../models/CampRegistration.js";

// /* ======================================================
//    NGO: CREATE BLOOD DONATION CAMP
//    ====================================================== */
// export const createCamp = async (req, res) => {
//   try {
//     // Only NGO can create camp (extra safety)
//     if (req.user.role !== "ngo") {
//       return res.status(403).json({
//         message: "Only NGO can create camps"
//       });
//     }

//     const camp = await NgoCamp.create({
//       ngoId: req.user.id,
//       campName: req.body.campName,
//       location: req.body.location,
//       startDate: req.body.startDate,
//       endDate: req.body.endDate,
//       description: req.body.description
//     });

//     res.status(201).json(camp);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// /* ======================================================
//    NGO: GET ALL CAMPS CREATED BY LOGGED-IN NGO
//    ====================================================== */
// export const getMyCamps = async (req, res) => {
//   try {
//     const camps = await NgoCamp.find({
//       ngoId: req.user.id
//     }).sort({ createdAt: -1 });

//     res.json(camps);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// /* ======================================================
//    NGO: CREATE SLOT FOR A CAMP
//    ====================================================== */
// export const createSlot = async (req, res) => {
//   try {
//     const { campId, slotTime, maxDonors } = req.body;

//     // Check camp exists
//     const camp = await NgoCamp.findById(campId);
//     if (!camp) {
//       return res.status(404).json({
//         message: "Camp not found"
//       });
//     }

//     // Ensure NGO owns this camp
//     if (camp.ngoId.toString() !== req.user.id) {
//       return res.status(403).json({
//         message: "You are not allowed to add slot to this camp"
//       });
//     }

//     const slot = await CampSlot.create({
//       campId,
//       slotTime,
//       maxDonors
//     });

//     res.status(201).json(slot);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// /* ======================================================
//    USER (DONOR): REGISTER TO A CAMP SLOT
//    ====================================================== */
// export const registerDonorToSlot = async (req, res) => {
//   try {
//     const { campId, slotId, bloodGroup } = req.body;
//     const donorId = req.user.id;

//     // Only normal users (donors)
//     if (req.user.role !== "user") {
//       return res.status(403).json({
//         message: "Only donors can register for camps"
//       });
//     }

//     // Check camp exists
//     const camp = await NgoCamp.findById(campId);
//     if (!camp) {
//       return res.status(404).json({
//         message: "Camp not found"
//       });
//     }

//     // Check slot exists
//     const slot = await CampSlot.findById(slotId);
//     if (!slot) {
//       return res.status(404).json({
//         message: "Slot not found"
//       });
//     }

//     // Check slot belongs to this camp
//     if (slot.campId.toString() !== campId) {
//       return res.status(400).json({
//         message: "Slot does not belong to this camp"
//       });
//     }

//     // Check slot capacity
//     if (slot.bookedCount >= slot.maxDonors) {
//       return res.status(400).json({
//         message: "Slot is already full"
//       });
//     }

//     // Prevent duplicate registration
//     const alreadyRegistered = await CampRegistration.findOne({
//       campId,
//       donorId
//     });

//     if (alreadyRegistered) {
//       return res.status(400).json({
//         message: "You already registered for this camp"
//       });
//     }

//     // Register donor
//     await CampRegistration.create({
//       campId,
//       slotId,
//       donorId,
//       bloodGroup
//     });

//     // Increase booked count
//     slot.bookedCount += 1;
//     await slot.save();

//     res.status(201).json({
//       message: "Donor registered successfully"
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };





// import NgoCamp from "../models/NgoCamp.js";
// import CampSlot from "../models/CampSlot.js";
// import CampRegistration from "../models/CampRegistration.js";

// /* CREATE CAMP */
// export const createCamp = async (req, res) => {
//   try {
//     if (req.user.role !== "ngo") {
//       return res.status(403).json({ message: "Only NGO can create camps" });
//     }

//     const camp = await NgoCamp.create({
//       ngoId: req.user.id,
//       campName: req.body.campName,
//       location: req.body.location,
//       startDate: req.body.startDate,
//       endDate: req.body.endDate,
//       description: req.body.description
//     });

//     res.status(201).json(camp);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// /* GET NGO CAMPS */
// export const getMyCamps = async (req, res) => {
//   try {
//     const camps = await NgoCamp.find({ ngoId: req.user.id });
//     res.json(camps);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// /* CREATE SLOT */
// export const createSlot = async (req, res) => {
//   try {
//     const { campId, slotTime, maxDonors } = req.body;

//     const camp = await NgoCamp.findById(campId);
//     if (!camp) {
//       return res.status(404).json({ message: "Camp not found" });
//     }

//     if (camp.ngoId.toString() !== req.user.id) {
//       return res.status(403).json({ message: "Not your camp" });
//     }

//     const slot = await CampSlot.create({
//       campId,
//       slotTime,
//       maxDonors
//     });

//     res.status(201).json(slot);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// /* GET CAMP SLOTS */
// export const getCampSlots = async (req, res) => {
//   try {
//     const slots = await CampSlot.find({ campId: req.params.campId });
//     res.json(slots);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// /* REGISTER DONOR TO SLOT */
// export const registerDonorToSlot = async (req, res) => {
//   try {
//     const {
//       campId,
//       slotId,
//       name,
//       mobileNumber,
//       address,
//       bloodGroup,
//       donationDate
//     } = req.body;

//     const donorId = req.user.id;

//     if (req.user.role !== "user") {
//       return res.status(403).json({ message: "Only users can donate" });
//     }

//     const slot = await CampSlot.findById(slotId);
//     if (!slot) {
//       return res.status(404).json({ message: "Slot not found" });
//     }

//     if (slot.bookedCount >= slot.maxDonors) {
//       return res.status(400).json({ message: "Slot full" });
//     }

//     const already = await CampRegistration.findOne({ campId, donorId });
//     if (already) {
//       return res.status(400).json({ message: "Already registered" });
//     }

//     await CampRegistration.create({
//       campId,
//       slotId,
//       donorId,
//       name,
//       mobileNumber,
//       address,
//       bloodGroup,
//       donationDate
//     });

//     slot.bookedCount += 1;
//     await slot.save();

//     res.status(201).json({ message: "Registered successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };





import NgoCamp from "../models/NgoCamp.js";
import CampSlot from "../models/CampSlot.js";
import CampRegistration from "../models/CampRegistration.js";

/* ======================================================
   NGO: CREATE BLOOD DONATION CAMP (UPDATED)
   ====================================================== */
export const createCamp = async (req, res) => {
  try {
    if (req.user.role !== "ngo") {
      return res.status(403).json({ message: "Only NGO can create camps" });
    }

    const {
      campName,
      description,
      location,
      city,
      state,
      pincode,
      startDate,
      endDate,
      contactPersonName,
      contactMobile,
      expectedDonors
    } = req.body;

    const camp = await NgoCamp.create({
      ngoId: req.user.id,
      campName,
      description,
      location,
      city,
      state,
      pincode,
      startDate,
      endDate,
      contactPersonName,
      contactMobile,
      expectedDonors
    });

    res.status(201).json(camp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================================================
   NGO: GET ALL CAMPS (UNCHANGED)
   ====================================================== */
export const getMyCamps = async (req, res) => {
  try {
    const camps = await NgoCamp.find({ ngoId: req.user.id })
      .sort({ createdAt: -1 });

    res.json(camps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================================================
   NGO: CREATE SLOT (AUTO UPDATE totalSlots)
   ====================================================== */
export const createSlot = async (req, res) => {
  try {
    const { campId, slotTime, maxDonors } = req.body;

    const camp = await NgoCamp.findById(campId);
    if (!camp) {
      return res.status(404).json({ message: "Camp not found" });
    }

    if (camp.ngoId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your camp" });
    }

    const slot = await CampSlot.create({
      campId,
      slotTime,
      maxDonors
    });

    // 🔄 Auto update totalSlots
    camp.totalSlots += 1;
    await camp.save();

    res.status(201).json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================================================
   GET CAMP SLOTS
   ====================================================== */
export const getCampSlots = async (req, res) => {
  try {
    const slots = await CampSlot.find({ campId: req.params.campId });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================================================
   USER: REGISTER DONOR TO SLOT (UPDATED)
   ====================================================== */
export const registerDonorToSlot = async (req, res) => {
  try {
    const {
      campId,
      slotId,
      name,
      mobileNumber,
      address,
      bloodGroup,
      donationDate
    } = req.body;

    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Only donors allowed" });
    }

    const slot = await CampSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    if (slot.bookedCount >= slot.maxDonors) {
      return res.status(400).json({ message: "Slot is full" });
    }

    const alreadyRegistered = await CampRegistration.findOne({
      campId,
      donorId: req.user.id
    });

    if (alreadyRegistered) {
      return res.status(400).json({ message: "Already registered" });
    }

    await CampRegistration.create({
      campId,
      slotId,
      donorId: req.user.id,
      name,
      mobileNumber,
      address,
      bloodGroup,
      donationDate
    });

    slot.bookedCount += 1;
    await slot.save();

    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
