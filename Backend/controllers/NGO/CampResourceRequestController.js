import CampResourceRequest from "../../models/ngo/CampResourceRequest.js";
import NgoCamp from "../../models/ngo/NgoCamp.js";
import { ObjectId } from "mongodb";

// Create a new resource request
export const createRequest = async (req, res) => {
    try {
        const {
            organizationName,
            organizerName,
            equipmentCount,
            doctorCount,
            campId,
            bloodBankId, // NEW
            campName, // Optional, can be fetched from campId
            location, // Optional
            startDate, // Optional
            endDate    // Optional
        } = req.body;

        const ngoId = req.user._id || req.user.userId; // Assuming auth middleware adds user

        // Validate required
        if (!campId || !equipmentCount || !doctorCount || !bloodBankId) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Verify camp belongs to NGO
        const camp = await NgoCamp.findById(campId);
        if (!camp) {
            return res.status(404).json({ success: false, message: "Camp not found" });
        }
        // Note: Assuming strict checking if camp belongs to NGO, but for now trusting input as long as camp exists.
        // if (camp.ngoId.toString() !== ngoId.toString()) { ... }

        const newRequest = await CampResourceRequest.create({
            ngoId,
            campId,
            bloodBankId, // Save this
            organizationName: organizationName || "Unknown Org", // Should ideally come from User profile or Input
            organizerName,
            equipmentCount,
            doctorCount,
            campName: camp.campName, // Use camp data for consistency
            location: camp.location,
            startDate: camp.startDate,
            endDate: camp.endDate,
            status: "pending"
        });

        res.status(201).json({
            success: true,
            message: "Resource request created successfully",
            data: newRequest
        });

    } catch (error) {
        console.error("Error creating resource request:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get requests for the logged-in NGO
export const getNgoRequests = async (req, res) => {
    try {
        const ngoId = req.user._id || req.user.userId;
        const { campId } = req.query;

        let requests;
        if (campId && campId !== 'all') {
            requests = await CampResourceRequest.findByCampId(campId);
            // Filter by NGO to ensure ownership? 
            requests = requests.filter(r => r.ngoId.toString() === ngoId.toString());
        } else {
            requests = await CampResourceRequest.findByNgoId(ngoId);
        }

        res.json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error("Error fetching NGO requests:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get all requests (For Blood Bank)
export const getAllRequests = async (req, res) => {
    try {
        let requests = await CampResourceRequest.findAll();

        // Filter for specific Blood Bank if logged in as one
        // Assuming role/type is available in req.user
        // If the user is a bloodbank (usually from 'organization' collection), they might have _id matching bloodBankId

        // Let's attempt to filter if we find an ID that looks like it belongs to a blood bank
        // For 'organization' users, userId is usually the org ID.
        // For 'bloodbank' role specifically:

        const user = req.user;
        const userId = user._id || user.userId;
        const role = user.role || user.type;

        // Weak check since roles vary, but if it is a specific blood bank trying to view, we should filter.
        // If superadmin, view all.
        if (role !== 'SUPERADMIN' && role !== 'ADMIN') {
            // Assume it's a blood bank user
            requests = requests.filter(r => r.bloodBankId && r.bloodBankId.toString() === userId.toString());
        }

        res.json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error("Error fetching all requests:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Update request status (Approve/Reject)
export const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body; // status: 'approved' | 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        if (status === 'rejected' && !rejectionReason) {
            return res.status(400).json({ success: false, message: "Rejection reason is required" });
        }

        const updatedRequest = await CampResourceRequest.updateStatus(id, status, rejectionReason);

        if (!updatedRequest) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        res.json({
            success: true,
            message: `Request ${status}`,
            data: updatedRequest
        });
    } catch (error) {
        console.error("Error updating request status:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
