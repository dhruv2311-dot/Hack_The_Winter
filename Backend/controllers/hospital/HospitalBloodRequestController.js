import HospitalBloodRequest from "../../models/hospital/HospitalBloodRequest.js";
import UrgencyCalculator from "../../utils/UrgencyCalculator.js";
import PriorityRequestHandler from "../../services/PriorityRequestHandler.js";
import bloodStockModel from "../../models/admin/BloodStock.js";

export class HospitalBloodRequestController {
    // ============= REQUEST CRUD =============

    /**
     * Create a new blood request with auto-calculated urgency
     * POST /api/hospital-blood-requests
     */
    static async createRequest(req, res) {
        try {
            const {
                hospitalId,
                bloodBankId,
                bloodGroup,
                unitsRequired,
                patientAge,
                patientCondition,
                department,
                medicalReason
            } = req.body;

            // Validate required fields
            if (!hospitalId || !bloodBankId || !bloodGroup || !unitsRequired) {
                return res.status(400).json({
                    success: false,
                    message: "Hospital ID, Blood Bank ID, blood group, and units required are mandatory"
                });
            }

            // Validate blood group
            const validBloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
            if (!validBloodGroups.includes(bloodGroup)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid blood group"
                });
            }

            // Check blood stock availability at blood bank
            const bloodStock = await bloodStockModel.findByBloodBankId(bloodBankId);
            
            const availableUnits = bloodStock?.bloodStock?.[bloodGroup]?.units || 0;
            const unitsRequiredInt = parseInt(unitsRequired);

            if (unitsRequiredInt > availableUnits) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient blood stock. Requested: ${unitsRequiredInt} units, Available: ${availableUnits} units`,
                    availableUnits: availableUnits,
                    requestedUnits: unitsRequiredInt
                });
            }

            // AUTO-CALCULATE URGENCY based on patient details
            const urgencyData = UrgencyCalculator.calculateUrgency({
                patientAge: parseInt(patientAge) || 30,
                patientCondition: patientCondition || "Stable",
                department: department || "General Ward",
                unitsRequired: unitsRequiredInt
            });

            const requestData = {
                hospitalId,
                bloodBankId,
                bloodGroup,
                unitsRequired: unitsRequiredInt,
                urgency: urgencyData.urgency,
                priority: urgencyData.priority,
                // Structured patient info for priority system
                patientInfo: {
                    patientId: null,
                    age: parseInt(patientAge) || 30,
                    gender: null,
                    condition: patientCondition || "Stable",
                    department: department || "General Ward"
                },
                medicalReason: medicalReason || "",
                hospitalNotes: `${medicalReason || ""} [Auto-calculated urgency: ${urgencyData.urgency}]`
            };

            // Get current blood availability for priority calculation
            const availability = await PriorityRequestHandler.getBloodAvailability(bloodGroup);

            // Enrich request data with priority calculation
            const enrichedData = await PriorityRequestHandler.enrichRequestWithPriority(
                requestData,
                availability
            );

            const request = await HospitalBloodRequest.create(enrichedData);

            res.status(201).json({
                success: true,
                message: "Blood request created successfully",
                data: {
                    ...request,
                    urgencyCalculation: urgencyData,
                    priority: PriorityRequestHandler.formatPriorityForResponse(request)
                }
            });
        } catch (error) {
            console.error("Error creating blood request:", error);
            res.status(500).json({
                success: false,
                message: "Failed to create blood request",
                error: error.message
            });
        }
    }

    /**
     * Get blood stock availability for a specific blood bank
     * GET /api/hospital-blood-requests/blood-stock/:bloodBankId
     */
    static async getBloodStockAvailability(req, res) {
        try {
            const { bloodBankId } = req.params;

            if (!bloodBankId) {
                return res.status(400).json({
                    success: false,
                    message: "Blood Bank ID is required"
                });
            }

            const bloodStock = await bloodStockModel.findByBloodBankId(bloodBankId);

            if (!bloodStock) {
                return res.status(404).json({
                    success: false,
                    message: "Blood stock not found for this blood bank"
                });
            }

            // Format the response with available units for each blood group
            const availability = {};
            Object.keys(bloodStock.bloodStock).forEach(group => {
                availability[group] = bloodStock.bloodStock[group].units;
            });

            res.status(200).json({
                success: true,
                data: {
                    bloodBankId: bloodBankId,
                    availability: availability,
                    totalUnitsAvailable: bloodStock.totalUnitsAvailable,
                    lastUpdated: bloodStock.lastStockUpdateAt
                }
            });
        } catch (error) {
            console.error("Error fetching blood stock availability:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch blood stock availability",
                error: error.message
            });
        }
    }

    /**
     * Get request by ID
     * GET /api/hospital-blood-requests/:id
     */
    static async getRequestById(req, res) {
        try {
            const { id } = req.params;

            const request = await HospitalBloodRequest.findById(id);

            if (!request) {
                return res.status(404).json({
                    success: false,
                    message: "Blood request not found"
                });
            }

            res.status(200).json({
                success: true,
                data: request
            });
        } catch (error) {
            console.error("Error fetching blood request:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch blood request",
                error: error.message
            });
        }
    }

    /**
     * Get all requests by hospital
     * GET /api/hospital-blood-requests/hospital/:hospitalId?status=PENDING&urgency=CRITICAL&bloodGroup=O+&page=1&limit=10
     */
    static async getRequestsByHospital(req, res) {
        try {
            const { hospitalId } = req.params;
            const { status, urgency, bloodGroup, page, limit } = req.query;

            const filters = {};
            if (status) filters.status = status;
            if (urgency) filters.urgency = urgency;
            if (bloodGroup) filters.bloodGroup = bloodGroup;

            const pagination = {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10
            };

            const result = await HospitalBloodRequest.findByHospitalId(hospitalId, filters, pagination);

            res.status(200).json({
                success: true,
                data: result.requests,
                pagination: result.pagination
            });
        } catch (error) {
            console.error("Error fetching hospital requests:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch hospital requests",
                error: error.message
            });
        }
    }

    /**
     * Get all requests by blood bank
     * GET /api/hospital-blood-requests/bloodbank/:bloodBankId?status=PENDING&urgency=CRITICAL&page=1&limit=10
     */
    static async getRequestsByBloodBank(req, res) {
        try {
            let { bloodBankId } = req.params;
            const { status, urgency, bloodGroup, page, limit } = req.query;

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
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10
            };

            const result = await HospitalBloodRequest.findByBloodBankId(bloodBankId, filters, pagination);

            res.status(200).json({
                success: true,
                data: result.requests,
                pagination: result.pagination,
                userRole,
                scoped: userRole === 'BLOOD_BANK_STAFF' || userOrgType === 'bloodbank'
            });
        } catch (error) {
            console.error("Error fetching blood bank requests:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch blood bank requests",
                error: error.message
            });
        }
    }

    /**
     * Get critical/urgent requests
     * GET /api/hospital-blood-requests/critical?hospitalId=xxx&bloodBankId=xxx
     */
    static async getCriticalRequests(req, res) {
        try {
            const { hospitalId, bloodBankId, page, limit } = req.query;

            const filters = {};
            if (hospitalId) filters.hospitalId = hospitalId;
            if (bloodBankId) filters.bloodBankId = bloodBankId;

            const pagination = {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10
            };

            const result = await HospitalBloodRequest.findCriticalRequests(filters, pagination);

            res.status(200).json({
                success: true,
                data: result.requests,
                pagination: result.pagination
            });
        } catch (error) {
            console.error("Error fetching critical requests:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch critical requests",
                error: error.message
            });
        }
    }

    /**
     * Update request
     * PUT /api/hospital-blood-requests/:id
     */
    static async updateRequest(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const success = await HospitalBloodRequest.updateById(id, updateData);

            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: "Blood request not found"
                });
            }

            // Fetch the updated request
            const request = await HospitalBloodRequest.findById(id);

            res.status(200).json({
                success: true,
                message: "Blood request updated successfully",
                data: request
            });
        } catch (error) {
            console.error("Error updating blood request:", error);
            res.status(500).json({
                success: false,
                message: "Failed to update blood request",
                error: error.message
            });
        }
    }

    /**
     * Accept request (Blood Bank action)
     * POST /api/hospital-blood-requests/:id/accept
     */
    static async acceptRequest(req, res) {
        try {
            const { id } = req.params;
            const { bloodBankResponse } = req.body;

            const success = await HospitalBloodRequest.acceptRequest(id, bloodBankResponse || "");

            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: "Blood request not found or already processed"
                });
            }

            // Fetch the updated request
            const request = await HospitalBloodRequest.findById(id);

            res.status(200).json({
                success: true,
                message: "Blood request accepted",
                data: request
            });
        } catch (error) {
            console.error("Error accepting blood request:", error);
            res.status(500).json({
                success: false,
                message: "Failed to accept blood request",
                error: error.message
            });
        }
    }

    /**
     * Reject request (Blood Bank action)
     * POST /api/hospital-blood-requests/:id/reject
     */
    static async rejectRequest(req, res) {
        try {
            const { id } = req.params;
            const { rejectionReason } = req.body;

            // Validate rejection reason is provided
            if (!rejectionReason || typeof rejectionReason !== 'string' || rejectionReason.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Rejection reason is required and cannot be empty"
                });
            }

            // Validate minimum length
            if (rejectionReason.trim().length < 5) {
                return res.status(400).json({
                    success: false,
                    message: "Rejection reason must be at least 5 characters long"
                });
            }

            // Validate maximum length
            if (rejectionReason.length > 500) {
                return res.status(400).json({
                    success: false,
                    message: "Rejection reason cannot exceed 500 characters"
                });
            }

            const success = await HospitalBloodRequest.rejectRequest(id, rejectionReason.trim());

            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: "Blood request not found or already processed"
                });
            }

            // Fetch the updated request
            const request = await HospitalBloodRequest.findById(id);

            res.status(200).json({
                success: true,
                message: "Blood request rejected",
                data: request
            });
        } catch (error) {
            console.error("Error rejecting blood request:", error);
            res.status(500).json({
                success: false,
                message: "Failed to reject blood request",
                error: error.message
            });
        }
    }

    /**
     * Complete request
     * POST /api/hospital-blood-requests/:id/complete
     */
    static async completeRequest(req, res) {
        try {
            const { id } = req.params;
            const { unitsFulfilled } = req.body;

            const success = await HospitalBloodRequest.fulfillRequest(id, unitsFulfilled);

            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: "Blood request not found or not in ACCEPTED status"
                });
            }

            // Fetch the updated request
            const request = await HospitalBloodRequest.findById(id);

            res.status(200).json({
                success: true,
                message: "Blood request marked as completed",
                data: request
            });
        } catch (error) {
            console.error("Error completing blood request:", error);
            res.status(500).json({
                success: false,
                message: "Failed to complete blood request",
                error: error.message
            });
        }
    }

    /**
     * Delete request
     * DELETE /api/hospital-blood-requests/:id
     */
    static async deleteRequest(req, res) {
        try {
            const { id } = req.params;

            const success = await HospitalBloodRequest.deleteById(id);

            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: "Blood request not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Blood request deleted successfully"
            });
        } catch (error) {
            console.error("Error deleting blood request:", error);
            res.status(500).json({
                success: false,
                message: "Failed to delete blood request",
                error: error.message
            });
        }
    }

    // ============= STATISTICS =============

    /**
     * Get request statistics for a hospital
     * GET /api/hospital-blood-requests/hospital/:hospitalId/stats
     */
    static async getHospitalRequestStats(req, res) {
        try {
            const { hospitalId } = req.params;

            const stats = await HospitalBloodRequest.getStatsByHospital(hospitalId);

            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error("Error fetching hospital request stats:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch request statistics",
                error: error.message
            });
        }
    }

    /**
     * Get request statistics for a blood bank
     * GET /api/hospital-blood-requests/bloodbank/:bloodBankId/stats
     */
    static async getBloodBankRequestStats(req, res) {
        try {
            const { bloodBankId } = req.params;

            const stats = await HospitalBloodRequest.getStatsByBloodBank(bloodBankId);

            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error("Error fetching blood bank request stats:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch request statistics",
                error: error.message
            });
        }
    }
}
