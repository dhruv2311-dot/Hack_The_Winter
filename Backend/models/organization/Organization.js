import { ObjectId } from "mongodb";
import { getDB } from "../../config/db.js";

export class Organization {
  // ============= CREATE =============

  /**
   * Create a new organization
   * @param {Object} organizationData - Organization details
   * @returns {Promise<Object>} Created organization
   */
  static async create(organizationData) {
    const db = getDB();

    const organization = {
      _id: new ObjectId(),
      ...organizationData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection("organizations").insertOne(organization);
    return { _id: result.insertedId, ...organizationData };
  }

  // ============= READ - SINGLE =============

  /**
   * Find organization by organizationCode
   * @param {string} organizationCode
   * @returns {Promise<Object|null>}
   */
  static async findByCode(organizationCode) {
    const db = getDB();
    return await db.collection("organizations").findOne({
      organizationCode: organizationCode
    });
  }

  /**
   * Find organization by ID
   * @param {ObjectId|string} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const db = getDB();
    return await db.collection("organizations").findOne({
      _id: new ObjectId(id)
    });
  }

  /**
   * Find organization by email
   * @param {string} email
   * @returns {Promise<Object|null>}
   */
  static async findByEmail(email) {
    const db = getDB();
    return await db.collection("organizations").findOne({
      email: email.toLowerCase()
    });
  }

  /**
   * Find organization by license number
   * @param {string} licenseNumber
   * @returns {Promise<Object|null>}
   */
  static async findByLicense(licenseNumber) {
    const db = getDB();
    return await db.collection("organizations").findOne({
      licenseNumber: licenseNumber
    });
  }

  /**
   * Find organization by admin email
   * @param {string} adminEmail
   * @returns {Promise<Object|null>}
   */
  static async findByAdminEmail(adminEmail) {
    const db = getDB();
    return await db.collection("organizations").findOne({
      adminEmail: adminEmail.toLowerCase()
    });
  }

  // ============= READ - MULTIPLE =============

  /**
   * Find all pending organizations with pagination
   * @param {Object} filters - Filter criteria
   * @param {Object} pagination - {page, limit}
   * @returns {Promise<Object>} {organizations, total, totalPages}
   */
  static async findAllPending(filters = {}, pagination = {}) {
    const db = getDB();
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    // Build filter
    let filter = { status: "PENDING" };
    if (filters.type && ["hospital", "bloodbank", "ngo"].includes(filters.type.toLowerCase())) {
      filter.type = filters.type.toLowerCase();
    }

    // Get organizations
    const organizations = await db
      .collection("organizations")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count
    const total = await db.collection("organizations").countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return {
      organizations,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit
      }
    };
  }

  /**
   * Find all organizations with filters and pagination
   * @param {Object} filters - Filter criteria {type, status}
   * @param {Object} pagination - {page, limit}
   * @returns {Promise<Object>} {organizations, total, totalPages}
   */
  static async findAll(filters = {}, pagination = {}) {
    const db = getDB();
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    // Build filter
    let filter = {};

    if (filters.type && ["hospital", "bloodbank", "ngo"].includes(filters.type.toLowerCase())) {
      filter.type = filters.type.toLowerCase();
    }

    if (filters.status) {
      filter.status = filters.status;
    }

    // Get organizations
    const organizations = await db
      .collection("organizations")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count
    const total = await db.collection("organizations").countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return {
      organizations,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit
      }
    };
  }

  /**
   * Get organizations by type and status
   * @param {string} type - Organization type
   * @param {string} status - Organization status
   * @returns {Promise<Array>}
   */
  static async findByTypeAndStatus(type, status) {
    const db = getDB();
    return await db.collection("organizations").find({
      type: type.toLowerCase(),
      status: status
    }).toArray();
  }

  /**
   * Find organizations by type and status with pagination
   * @param {string} type - hospital, bloodbank, or ngo
   * @param {string} status - PENDING, APPROVED, REJECTED, SUSPENDED
   * @param {Object} pagination - {page, limit}
   * @returns {Promise<Object>} {organizations, pagination}
   */
  static async findByTypeAndStatusPaginated(type, status, pagination = {}) {
    const db = getDB();
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const filter = {
      type: type.toLowerCase(),
      status: status
    };

    // Get organizations
    const organizations = await db
      .collection("organizations")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count
    const total = await db.collection("organizations").countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return {
      organizations,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit
      }
    };
  }

  /**
   * Count organizations by type
   * @param {string} type
   * @returns {Promise<number>}
   */
  static async countByType(type) {
    const db = getDB();
    return await db.collection("organizations").countDocuments({
      type: type.toLowerCase()
    });
  }

  /**
   * Count organizations by type and city (for code generation)
   * @param {string} type
   * @param {string} city
   * @returns {Promise<number>}
   */
  static async countByTypeAndCity(type, city) {
    const db = getDB();
    return await db.collection("organizations").countDocuments({
      type: type.toLowerCase(),
      "location.city": city
    });
  }

  /**
   * Get organizations created in specific year
   * @param {number} year
   * @returns {Promise<Array>}
   */
  static async findByYear(year) {
    const db = getDB();
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    return await db.collection("organizations").find({
      createdAt: {
        $gte: startDate,
        $lt: endDate
      }
    }).toArray();
  }

  // ============= UPDATE =============

  /**
   * Update organization status
   * @param {string} organizationCode
   * @param {string} newStatus
   * @param {Object} additionalData - Additional fields to update
   * @returns {Promise<Object>} Updated organization
   */
  static async updateStatus(organizationCode, newStatus, additionalData = {}) {
    const db = getDB();

    const updateData = {
      status: newStatus,
      updatedAt: new Date(),
      ...additionalData
    };

    const result = await db.collection("organizations").findOneAndUpdate(
      { organizationCode: organizationCode },
      { $set: updateData },
      { returnDocument: "after" }
    );

    return result.value;
  }

  /**
   * Approve organization and set admin reference
   * @param {string} organizationCode
   * @param {Object} organizationAdminData - {name, email, userCode}
   * @param {string} approvalRemarks
   * @returns {Promise<Object>}
   */
  static async approve(organizationCode, organizationAdminData, approvalRemarks = "") {
    const db = getDB();

    const updateData = {
      status: "APPROVED",
      approvedAt: new Date(),
      approvalRemarks: approvalRemarks,
      organizationAdmin: organizationAdminData,
      updatedAt: new Date()
    };

    const result = await db.collection("organizations").findOneAndUpdate(
      { organizationCode: organizationCode },
      { $set: updateData },
      { returnDocument: "after" }
    );

    return result.value;
  }

  /**
   * Reject organization
   * @param {string} organizationCode
   * @param {string} rejectionReason
   * @returns {Promise<Object>}
   */
  static async reject(organizationCode, rejectionReason) {
    const db = getDB();

    const updateData = {
      status: "REJECTED",
      rejectionReason: rejectionReason,
      updatedAt: new Date()
    };

    const result = await db.collection("organizations").findOneAndUpdate(
      { organizationCode: organizationCode },
      { $set: updateData },
      { returnDocument: "after" }
    );

    return result.value;
  }

  /**
   * Suspend organization
   * @param {string} organizationCode
   * @param {string} suspensionReason
   * @returns {Promise<Object>}
   */
  static async suspend(organizationCode, suspensionReason) {
    const db = getDB();

    const updateData = {
      status: "SUSPENDED",
      suspensionReason: suspensionReason,
      updatedAt: new Date()
    };

    const result = await db.collection("organizations").findOneAndUpdate(
      { organizationCode: organizationCode },
      { $set: updateData },
      { returnDocument: "after" }
    );

    return result.value;
  }

  /**
   * Update organization details
   * @param {string} organizationCode
   * @param {Object} updateData
   * @returns {Promise<Object>}
   */
  static async update(organizationCode, updateData) {
    const db = getDB();

    const data = {
      ...updateData,
      updatedAt: new Date()
    };

    const result = await db.collection("organizations").findOneAndUpdate(
      { organizationCode: organizationCode },
      { $set: data },
      { returnDocument: "after" }
    );

    return result.value;
  }

  // ============= DELETE =============

  /**
   * Delete organization
   * @param {string} organizationCode
   * @returns {Promise<Object>}
   */
  static async delete(organizationCode) {
    const db = getDB();

    const result = await db.collection("organizations").deleteOne({
      organizationCode: organizationCode
    });

    return result;
  }

  // ============= STATISTICS =============

  /**
   * Get statistics about organizations
   * @returns {Promise<Object>}
   */
  static async getStats() {
    const db = getDB();

    const stats = {
      total: await db.collection("organizations").countDocuments(),
      byType: {},
      byStatus: {}
    };

    // Count by type
    const types = ["hospital", "bloodbank", "ngo"];
    for (const type of types) {
      stats.byType[type] = await db.collection("organizations").countDocuments({
        type: type
      });
    }

    // Count by status
    const statuses = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"];
    for (const status of statuses) {
      stats.byStatus[status] = await db.collection("organizations").countDocuments({
        status: status
      });
    }

    return stats;
  }

  /**
   * Get approval stats
   * @returns {Promise<Object>}
   */
  static async getApprovalStats() {
    const db = getDB();

    const pipeline = [
      {
        $group: {
          _id: "$type",
          pending: {
            $sum: {
              $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0]
            }
          },
          approved: {
            $sum: {
              $cond: [{ $eq: ["$status", "APPROVED"] }, 1, 0]
            }
          },
          rejected: {
            $sum: {
              $cond: [{ $eq: ["$status", "REJECTED"] }, 1, 0]
            }
          }
        }
      }
    ];

    return await db.collection("organizations").aggregate(pipeline).toArray();
  }
  /**
   * Search organizations by blood stock availability
   * @param {string} bloodType - e.g., 'A+', 'O-'
   * @param {number} minUnits - Minimum units required
   * @param {string} city - Optional city filter
   * @returns {Promise<Array>} List of organizations with stock
   */
  static async searchBloodStock(bloodType, minUnits = 1, city = null, latitude = null, longitude = null, radius = 5) {
    const db = getDB();
    const minUnitsInt = parseInt(minUnits) || 1;

    console.log(`[BLOOD_SEARCH] Searching for ${bloodType} >= ${minUnitsInt} units. Location: ${latitude}, ${longitude}`);

    // ============================================
    // CASE 1: GEOSPATIAL SEARCH (If Lat/Long provided)
    // ============================================
    if (latitude && longitude) {
      try {
        const searchRadiusMeters = (parseInt(radius) || 5) * 1000;

        // Ensure Index Exists (Idempotent)
        try {
          await db.collection("organizations").createIndex({ location: "2dsphere" });
        } catch (idxError) {
          console.warn("Failed to create geospatial index on organizations:", idxError.message);
          // If index creation fails, $geoNear will likely fail too, triggering the outer catch
        }

        const pipeline = [
          // 1. Find nearby Blood Banks first using $geoNear (Must be first stage)
          {
            $geoNear: {
              near: { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] },
              distanceField: "distance",
              maxDistance: searchRadiusMeters,
              query: { type: "bloodbank" }, // Only look for bloodbanks
              spherical: true
            }
          },
          // 2. Lookup their Blood Stock
          {
            $lookup: {
              from: "blood_stock",
              localField: "_id",
              foreignField: "bloodBankId",
              as: "stockData"
            }
          },
          // 3. Unwind stock data (preserve organizations even if no stock doc exists, but we filter later)
          { $unwind: "$stockData" },
          // 4. Filter by Blood Availability
          {
            $match: {
              [`stockData.bloodStock.${bloodType}.units`]: { $gte: minUnitsInt }
            }
          },
          // 5. Project Final Shape
          {
            $project: {
              _id: "$stockData._id", // Use Stock ID for frontend compatibility
              bloodBankId: "$_id",   // Original Org ID
              bloodStock: "$stockData.bloodStock",
              lastStockUpdateAt: "$stockData.lastStockUpdateAt",
              distance: 1, // Include distance from hospital

              // Organization Details
              name: "$name",
              organizationCode: "$organizationCode",
              type: "$type",
              email: "$email",
              phone: "$phone",
              address: "$address",
              location: "$location",
              status: "$status"
            }
          },
          // 6. Sort by distance (Nearest first)
          { $sort: { distance: 1 } }
        ];

        const results = await db.collection("organizations").aggregate(pipeline).toArray();
        console.log(`[BLOOD_SEARCH] Found ${results.length} results via Geospatial Search (${radius}km)`);
        return results;
      } catch (geoError) {
        console.warn("Geospatial search failed (falling back to City search):", geoError.message);
      }
    }

    // ============================================
    // CASE 2: CITY/STRATEGY SEARCH (Legacy Fallback)
    // ============================================
    // 1. Build query for blood_stock collection
    const stockQuery = {
      [`bloodStock.${bloodType}.units`]: { $gte: minUnitsInt }
    };

    console.log(`[BLOOD_SEARCH] Primary Query on blood_stock:`, JSON.stringify(stockQuery));

    const pipeline = [
      { $match: stockQuery },
      {
        $lookup: {
          from: "organizations",
          localField: "bloodBankId",
          foreignField: "_id",
          as: "organization"
        }
      },
      { $unwind: "$organization" },
      {
        $project: {
          _id: 1, // Stock ID
          bloodBankId: 1,
          bloodStock: 1, // Keep the stock object from blood_stock collection to display counts
          lastStockUpdateAt: 1,

          // Organization Details
          name: "$organization.name",
          organizationCode: "$organization.organizationCode",
          type: "$organization.type",
          email: "$organization.email",
          phone: "$organization.phone",
          address: "$organization.address",
          location: "$organization.location",
          status: "$organization.status"
        }
      }
    ];

    // Add City Filter if provided
    if (city) {
      pipeline.push({
        $match: {
          "location.city": new RegExp(city, "i")
        }
      });
    }

    const results = await db.collection("blood_stock").aggregate(pipeline).toArray();
    console.log(`[BLOOD_SEARCH] Found ${results.length} results via Normal Search`);
    return results;
  }

}
