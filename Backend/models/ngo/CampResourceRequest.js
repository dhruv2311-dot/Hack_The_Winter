import { ObjectId } from "mongodb";
import { getDB } from "../../config/db.js";

/**
 * CampResourceRequest Model
 * Handles resource requests (equipment, doctors) for camps from NGO to Bloodbank
 */
class CampResourceRequest {
    constructor(data) {
        this._id = data._id || new ObjectId();
        this.ngoId = data.ngoId ? new ObjectId(data.ngoId) : null;
        this.bloodBankId = data.bloodBankId ? new ObjectId(data.bloodBankId) : null; // Optional if broadcast, but usually targeted
        this.campId = data.campId ? new ObjectId(data.campId) : null;

        // Details
        this.organizationName = data.organizationName || "";
        this.organizerName = data.organizerName || "";
        this.campName = data.campName || "";
        this.location = data.location || "";

        this.equipmentCount = parseInt(data.equipmentCount || 0);
        this.doctorCount = parseInt(data.doctorCount || 0);

        this.startDate = data.startDate ? new Date(data.startDate) : null;
        this.endDate = data.endDate ? new Date(data.endDate) : null;

        this.status = data.status || "pending"; // pending, approved, rejected
        this.rejectionReason = data.rejectionReason || null;

        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    static async create(requestData) {
        const db = getDB();
        const request = new CampResourceRequest(requestData);
        const result = await db.collection("campResourceRequests").insertOne(request);
        request._id = result.insertedId;
        return request;
    }

    static async findByNgoId(ngoId) {
        const db = getDB();
        const requests = await db
            .collection("campResourceRequests")
            .find({ ngoId: new ObjectId(ngoId) })
            .sort({ createdAt: -1 })
            .toArray();
        return requests.map(r => new CampResourceRequest(r));
    }

    static async findByCampId(campId) {
        const db = getDB();
        const requests = await db
            .collection("campResourceRequests")
            .find({ campId: new ObjectId(campId) })
            .sort({ createdAt: -1 })
            .toArray();
        return requests.map(r => new CampResourceRequest(r));
    }

    // Find all requests (optionally filtered by Blood Bank if we assign them)
    // If no bloodBankId is passed, it returns all (maybe for SuperAdmin or public pool?)
    // For this use case, we might want to see all pending or all requests.
    static async findAll() {
        const db = getDB();
        const requests = await db
            .collection("campResourceRequests")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();
        return requests.map(r => new CampResourceRequest(r));
    }

    static async findById(id) {
        const db = getDB();
        const request = await db.collection("campResourceRequests").findOne({
            _id: new ObjectId(id)
        });
        return request ? new CampResourceRequest(request) : null;
    }

    static async updateStatus(id, status, reason = null) {
        const db = getDB();
        const updateData = {
            status,
            updatedAt: new Date()
        };
        if (reason) {
            updateData.rejectionReason = reason;
        }

        const result = await db.collection("campResourceRequests").findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updateData },
            { returnDocument: "after" }
        );

        // Handle possible driver differences (v4 vs v5/v6)
        // result might be the document itself, or result.value
        // If result is null, not found.
        if (!result) return null;

        const doc = result.value || result;
        // Verify it's actually the document (has _id)
        if (!doc || !doc._id) return null;

        return new CampResourceRequest(doc);
    }
}

export default CampResourceRequest;
