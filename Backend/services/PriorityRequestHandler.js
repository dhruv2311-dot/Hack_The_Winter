/**
 * Priority Request Handler Utility
 * Used by controllers to integrate priority calculation with blood requests
 * 
 * This utility handles:
 * - Calculating priority when request is created
 * - Recalculating priority when blood availability changes
 * - Handling priority-based search and filtering
 */

import PriorityCalculator from "../models/admin/PriorityCalculator.js";
import HospitalBloodRequest from "../models/admin/HospitalBloodRequest.js";
import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

export class PriorityRequestHandler {
  /**
   * Calculate and store priority when creating a blood request
   * @param {Object} requestData - The blood request data
   * @param {number} currentBloodAvailability - Current stock of blood type
   * @returns {Object} Request data with priority fields populated
   */
  static async enrichRequestWithPriority(requestData, currentBloodAvailability = 0) {
    try {
      // Calculate priority
      const priorityResult = PriorityCalculator.calculatePriority(
        {
          urgency: requestData.urgency,
          bloodGroup: requestData.bloodGroup,
          createdAt: new Date(),
          requiredBy: requestData.requiredBy || null
        },
        currentBloodAvailability
      );

      // Add priority fields to request data
      return {
        ...requestData,
        priorityScore: priorityResult.score,
        priorityCategory: priorityResult.category,
        priorityDetails: priorityResult.breakdown,
        priorityCalculatedAt: new Date()
      };
    } catch (error) {
      console.error("Error enriching request with priority:", error);
      // Return without priority if calculation fails
      return {
        ...requestData,
        priorityScore: 50, // Default medium
        priorityCategory: "MEDIUM",
        priorityDetails: null
      };
    }
  }

  /**
   * Recalculate priority for existing request
   * Call when blood availability changes or other factors update
   * @param {string} requestId - Request ID to update
   * @param {Object} request - Full request object with urgency, bloodGroup, etc
   * @param {number} currentBloodAvailability - Current stock level
   */
  static async recalculateAndUpdatePriority(requestId, request, currentBloodAvailability = 0) {
    try {
      const priorityResult = PriorityCalculator.calculatePriority(request, currentBloodAvailability);

      // Update request with new priority
      await HospitalBloodRequest.updatePriority(
        requestId,
        priorityResult.score,
        priorityResult.category,
        priorityResult.breakdown
      );

      console.log(`✅ Priority recalculated for request ${requestId}: ${priorityResult.category} (${priorityResult.score})`);

      return priorityResult;
    } catch (error) {
      console.error("Error recalculating priority:", error);
      return null;
    }
  }

  /**
   * Get current blood availability for a blood type
   * @param {string} bloodType - Blood type (O+, AB-, etc)
   * @returns {number} Available units
   */
  static async getBloodAvailability(bloodType) {
    try {
      const db = getDB();
      const bloodStock = await db
        .collection("blood_stocks")
        .findOne({ bloodGroup: bloodType });

      return bloodStock?.units || 0;
    } catch (error) {
      console.error(`Error getting availability for ${bloodType}:`, error);
      return 0;
    }
  }

  /**
   * Create priority response object for API response
   * @param {Object} request - The request document
   * @returns {Object} Priority information formatted for API
   */
  static formatPriorityForResponse(request) {
    if (!request) return null;

    const categoryDetails = PriorityCalculator.getCategoryDetails(request.priorityCategory);

    return {
      score: request.priorityScore || 0,
      category: request.priorityCategory || "MEDIUM",
      categoryDetails: categoryDetails,
      breakdown: request.priorityDetails || {},
      calculatedAt: request.priorityCalculatedAt,
      recalculatedAt: request.priorityRecalculatedAt,
      actionRequired: categoryDetails.actionRequired,
      expectedResponseTime: categoryDetails.responseTime
    };
  }

  /**
   * Get priority queue (all pending requests sorted by priority)
   * @param {Object} filters - Additional filters (organizationId, bloodGroup, etc)
   * @param {number} limit - Max requests to return
   * @returns {Array} Requests sorted by priority
   */
  static async getPriorityQueue(filters = {}, limit = 100) {
    try {
      const requests = await HospitalBloodRequest.getPendingByPriority(filters);

      // Return with priority details formatted
      return requests.slice(0, limit).map(req => ({
        _id: req._id,
        requestCode: req.requestCode,
        bloodGroup: req.bloodGroup,
        unitsRequired: req.unitsRequired,
        hospitalId: req.hospitalId,
        urgency: req.urgency,
        priority: this.formatPriorityForResponse(req),
        createdAt: req.createdAt,
        status: req.status
      }));
    } catch (error) {
      console.error("Error getting priority queue:", error);
      return [];
    }
  }

  /**
   * Get priority queue with organization information
   * Includes details about which organization raised request and which is assigned
   * @param {Object} filters - Filters (hospitalId, bloodBankId, etc)
   * @param {number} limit - Max requests to return
   * @returns {Array} Requests with organization details
   */
  static async getPriorityQueueWithOrgInfo(filters = {}, limit = 100) {
    try {
      const db = getDB();
      const requests = await HospitalBloodRequest.getPendingByPriority(filters);
      const orgCollection = db.collection('organizations');

      // Fetch organization details and attach to requests
      const enrichedRequests = await Promise.all(
        requests.slice(0, limit).map(async (req) => {
          const hospital = req.hospitalId ? 
            await orgCollection.findOne({ _id: new ObjectId(req.hospitalId) }) : null;
          const bloodBank = req.bloodBankId ? 
            await orgCollection.findOne({ _id: new ObjectId(req.bloodBankId) }) : null;

          return {
            _id: req._id,
            requestCode: req.requestCode,
            bloodGroup: req.bloodGroup,
            unitsRequired: req.unitsRequired,
            urgency: req.urgency,
            priority: this.formatPriorityForResponse(req),
            createdAt: req.createdAt,
            status: req.status,
            // Organization information
            raisedfrom: hospital ? {
              id: hospital._id,
              name: hospital.name,
              code: hospital.organizationCode,
              type: 'Hospital',
              location: hospital.location
            } : null,
            assignedTo: bloodBank ? {
              id: bloodBank._id,
              name: bloodBank.name,
              code: bloodBank.organizationCode,
              type: 'Blood Bank',
              location: bloodBank.location
            } : {
              name: 'Unassigned',
              type: 'Pending Assignment'
            },
            // Raw IDs for API use
            hospitalId: req.hospitalId,
            bloodBankId: req.bloodBankId
          };
        })
      );

      return enrichedRequests;
    } catch (error) {
      console.error("Error getting priority queue with org info:", error);
      return [];
    }
  }

  /**
   * Get priority dashboard statistics
   * @returns {Object} Statistics about priority distribution
   */
  static async getPriorityDashboardStats() {
    try {
      const statsArray = await HospitalBloodRequest.getPriorityStats();

      if (statsArray.length === 0) {
        return {
          byCategory: [],
          byUrgency: [],
          byBloodGroup: [],
          totals: {}
        };
      }

      const stats = statsArray[0];

      // Format totals with category details
      const categorySummary = {
        CRITICAL: {
          count: stats.totals[0]?.totalCritical || 0,
          avgScore: 220,
          color: "red",
          emoji: "🔴"
        },
        HIGH: {
          count: stats.totals[0]?.totalHigh || 0,
          avgScore: 160,
          color: "orange",
          emoji: "🟠"
        },
        MEDIUM: {
          count: stats.totals[0]?.totalMedium || 0,
          avgScore: 110,
          color: "yellow",
          emoji: "🟡"
        },
        LOW: {
          count: stats.totals[0]?.totalLow || 0,
          avgScore: 40,
          color: "green",
          emoji: "🟢"
        }
      };

      return {
        totals: {
          totalRequests: stats.totals[0]?.totalRequests || 0,
          critical: stats.totals[0]?.totalCritical || 0,
          high: stats.totals[0]?.totalHigh || 0,
          medium: stats.totals[0]?.totalMedium || 0,
          low: stats.totals[0]?.totalLow || 0,
          averageScore: Math.round(stats.totals[0]?.avgScore || 0),
          maxScore: stats.totals[0]?.maxScore || 0,
          minScore: stats.totals[0]?.minScore || 0
        },
        byCategory: stats.byCategory,
        byUrgency: stats.byUrgency,
        byBloodGroup: stats.byBloodGroup,
        categorySummary: categorySummary
      };
    } catch (error) {
      console.error("Error getting priority dashboard stats:", error);
      return {
        totals: {},
        byCategory: [],
        byUrgency: [],
        byBloodGroup: [],
        categorySummary: {}
      };
    }
  }

  /**
   * Batch recalculate priorities (useful for scheduled job)
   * Recalculates priority for all pending requests
   * @returns {Object} Stats about recalculation
   */
  static async batchRecalculatePriorities() {
    try {
      const db = getDB();
      const collection = db.collection("hospital_blood_requests");

      // Get all pending requests
      const requests = await collection
        .find({ status: "PENDING", isActive: true })
        .toArray();

      let updated = 0;
      let errors = 0;

      for (const request of requests) {
        try {
          const availability = await this.getBloodAvailability(request.bloodGroup);
          const priorityResult = PriorityCalculator.calculatePriority(request, availability);

          await collection.updateOne(
            { _id: request._id },
            {
              $set: {
                priorityScore: priorityResult.score,
                priorityCategory: priorityResult.category,
                priorityDetails: priorityResult.breakdown,
                priorityRecalculatedAt: new Date()
              }
            }
          );

          updated++;
        } catch (err) {
          console.error(`Error recalculating priority for ${request._id}:`, err);
          errors++;
        }
      }

      console.log(`✅ Batch priority recalculation: ${updated} updated, ${errors} errors`);

      return {
        totalProcessed: requests.length,
        updated: updated,
        errors: errors,
        success: errors === 0
      };
    } catch (error) {
      console.error("Error in batch recalculation:", error);
      return {
        totalProcessed: 0,
        updated: 0,
        errors: 1,
        success: false
      };
    }
  }

  /**
   * Validate priority system configuration
   * @returns {Object} Validation result
   */
  static validateConfiguration() {
    const validation = {
      validUrgencies: PriorityCalculator.getValidUrgencies(),
      validBloodGroups: PriorityCalculator.getValidBloodGroups(),
      weights: {
        urgency: PriorityCalculator.URGENCY_WEIGHT,
        rarity: PriorityCalculator.RARITY_WEIGHT,
        time: PriorityCalculator.TIME_WEIGHT,
        availability: PriorityCalculator.AVAILABILITY_WEIGHT
      },
      totalWeight: (
        PriorityCalculator.URGENCY_WEIGHT +
        PriorityCalculator.RARITY_WEIGHT +
        PriorityCalculator.TIME_WEIGHT +
        PriorityCalculator.AVAILABILITY_WEIGHT
      ),
      isValid: true
    };

    // Check weights sum to 1.0
    if (Math.abs(validation.totalWeight - 1.0) > 0.01) {
      validation.isValid = false;
      validation.error = "Weights do not sum to 1.0";
    }

    return validation;
  }
}

export default PriorityRequestHandler;
