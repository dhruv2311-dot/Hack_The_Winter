import { getDB } from "../../config/db.js";

/**
 * Dashboard Model
 * Aggregates data from multiple collections for admin dashboard
 */
class Dashboard {
  constructor() {
    this.db = getDB;
  }

  // ============= ORGANIZATION STATISTICS =============
  async getOrganizationStats() {
    const db = this.db();
    const orgCollection = db.collection("organizations");

    const stats = await orgCollection.aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          byType: [
            { $group: { _id: "$type", count: { $sum: 1 } } }
          ],
          byStatus: [
            { $group: { _id: "$status", count: { $sum: 1 } } }
          ],
          pending: [
            { $match: { status: "PENDING" } },
            { $count: "count" }
          ],
          approved: [
            { $match: { status: "APPROVED" } },
            { $count: "count" }
          ],
          suspended: [
            { $match: { status: "SUSPENDED" } },
            { $count: "count" }
          ]
        }
      }
    ]).toArray();

    if (stats.length === 0) {
      return {
        total: 0,
        byType: [],
        byStatus: [],
        pending: 0,
        approved: 0,
        suspended: 0
      };
    }

    const result = stats[0];
    return {
      total: result.total.length > 0 ? result.total[0].count : 0,
      hospitals: result.byType.find(t => t._id === "hospital")?.count || 0,
      bloodBanks: result.byType.find(t => t._id === "bloodbank")?.count || 0,
      ngos: result.byType.find(t => t._id === "ngo")?.count || 0,
      pending: result.pending.length > 0 ? result.pending[0].count : 0,
      approved: result.approved.length > 0 ? result.approved[0].count : 0,
      suspended: result.suspended.length > 0 ? result.suspended[0].count : 0
    };
  }

  // ============= BLOOD STOCK STATISTICS =============
  async getBloodStockStats() {
    const db = this.db();
    const stockCollection = db.collection("blood_stock");

    const stats = await stockCollection.aggregate([
      {
        $facet: {
          totalUnits: [
            { $group: { _id: null, total: { $sum: "$totalUnitsAvailable" } } }
          ],
          criticalCount: [
            { $match: { criticalCount: { $gt: 0 } } },
            { $count: "count" }
          ],
          bloodBankCount: [
            { $count: "count" }
          ]
        }
      }
    ]).toArray();

    if (stats.length === 0) {
      return {
        totalUnitsAvailable: 0,
        criticalBloodBanks: 0,
        totalBloodBanks: 0,
        status: "OK"
      };
    }

    const result = stats[0];
    const totalUnits = result.totalUnits.length > 0 ? result.totalUnits[0].total : 0;
    const criticalBloodBanks = result.criticalCount.length > 0 ? result.criticalCount[0].count : 0;
    const totalBloodBanks = result.bloodBankCount.length > 0 ? result.bloodBankCount[0].count : 0;

    let status = "OK";
    if (criticalBloodBanks > totalBloodBanks * 0.5) {
      status = "CRITICAL";
    } else if (criticalBloodBanks > 0) {
      status = "WARNING";
    }

    return {
      totalUnitsAvailable: totalUnits,
      criticalBloodBanks,
      totalBloodBanks,
      status
    };
  }

  // ============= ALERT STATISTICS =============
  async getAlertStats() {
    const db = this.db();
    const alertCollection = db.collection("alerts");

    const stats = await alertCollection.aggregate([
      { $match: { status: "ACTIVE" } },
      {
        $facet: {
          total: [{ $count: "count" }],
          unread: [
            { $match: { isRead: false } },
            { $count: "count" }
          ],
          critical: [
            { $match: { severity: "CRITICAL" } },
            { $count: "count" }
          ],
          high: [
            { $match: { severity: "HIGH" } },
            { $count: "count" }
          ],
          byType: [
            { $group: { _id: "$type", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
          ]
        }
      }
    ]).toArray();

    if (stats.length === 0) {
      return {
        total: 0,
        unread: 0,
        critical: 0,
        high: 0,
        byType: []
      };
    }

    const result = stats[0];
    return {
      total: result.total.length > 0 ? result.total[0].count : 0,
      unread: result.unread.length > 0 ? result.unread[0].count : 0,
      critical: result.critical.length > 0 ? result.critical[0].count : 0,
      high: result.high.length > 0 ? result.high[0].count : 0,
      byType: result.byType
    };
  }

  // ============= USER STATISTICS =============
  async getUserStats() {
    const db = this.db();
    const userCollection = db.collection("organizationUsers");
    const adminCollection = db.collection("admins");

    const orgUsers = await userCollection.countDocuments({ isActive: true });
    const admins = await adminCollection.countDocuments({ isActive: true });

    return {
      organizationUsers: orgUsers,
      systemAdmins: admins,
      total: orgUsers + admins
    };
  }

  // ============= RECENT ACTIVITY =============
  async getRecentActivity(limit = 10) {
    const db = this.db();
    const auditCollection = db.collection("audit_logs");

    return await auditCollection
      .find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }

  // ============= SYSTEM HEALTH =============
  async getSystemHealth() {
    const db = this.db();

    try {
      // Check all major collections
      const collections = ["organizations", "blood_stock", "alerts", "audit_logs", "emergencies"];
      const health = {};

      for (const collName of collections) {
        try {
          const count = await db.collection(collName).countDocuments();
          health[collName] = { status: "OK", documentCount: count };
        } catch (error) {
          health[collName] = { status: "ERROR", error: error.message };
        }
      }

      return {
        database: "CONNECTED",
        collections: health,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        database: "ERROR",
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  // ============= GROWTH TRENDS (6 months) =============
  async getGrowthTrends() {
    const db = this.db();
    const orgCollection = db.collection("organizations");

    // Get data for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trends = await orgCollection.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            type: "$type"
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]).toArray();

    // Format data for last 6 months (if not enough historical data, use current counts)
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const monthNum = date.getMonth() + 1;

      const monthTrends = trends.filter(t => 
        t._id.year === year && t._id.month === monthNum
      );

      months.push({
        month,
        hospitals: monthTrends.find(t => t._id.type === "hospital")?.count || 0,
        ngos: monthTrends.find(t => t._id.type === "ngo")?.count || 0,
        banks: monthTrends.find(t => t._id.type === "bloodbank")?.count || 0
      });
    }

    return months;
  }

  // ============= BLOOD TYPE BREAKDOWN =============
  async getBloodTypeBreakdown() {
    const db = this.db();
    const stockCollection = db.collection("blood_stock");

    const breakdown = await stockCollection.aggregate([
      {
        $project: {
          O_positive: "$bloodStock.O+.units",
          O_negative: "$bloodStock.O-.units",
          A_positive: "$bloodStock.A+.units",
          A_negative: "$bloodStock.A-.units",
          B_positive: "$bloodStock.B+.units",
          B_negative: "$bloodStock.B-.units",
          AB_positive: "$bloodStock.AB+.units",
          AB_negative: "$bloodStock.AB-.units"
        }
      },
      {
        $group: {
          _id: null,
          O_plus: { $sum: "$O_positive" },
          O_minus: { $sum: "$O_negative" },
          A_plus: { $sum: "$A_positive" },
          A_minus: { $sum: "$A_negative" },
          B_plus: { $sum: "$B_positive" },
          B_minus: { $sum: "$B_negative" },
          AB_plus: { $sum: "$AB_positive" },
          AB_minus: { $sum: "$AB_negative" }
        }
      }
    ]).toArray();

    if (breakdown.length === 0) {
      return [
        { name: 'O+', units: 0 },
        { name: 'O-', units: 0 },
        { name: 'A+', units: 0 },
        { name: 'A-', units: 0 },
        { name: 'B+', units: 0 },
        { name: 'B-', units: 0 },
        { name: 'AB+', units: 0 },
        { name: 'AB-', units: 0 }
      ];
    }

    const result = breakdown[0];
    return [
      { name: 'O+', units: Math.max(0, result.O_plus || 0) },
      { name: 'O-', units: Math.max(0, result.O_minus || 0) },
      { name: 'A+', units: Math.max(0, result.A_plus || 0) },
      { name: 'A-', units: Math.max(0, result.A_minus || 0) },
      { name: 'B+', units: Math.max(0, result.B_plus || 0) },
      { name: 'B-', units: Math.max(0, result.B_minus || 0) },
      { name: 'AB+', units: Math.max(0, result.AB_plus || 0) },
      { name: 'AB-', units: Math.max(0, result.AB_minus || 0) }
    ];
  }

  // ============= ACTIVE USERS TRENDS =============
  async getActiveUsersTrend() {
    const db = this.db();
    const userCollection = db.collection("organizationUsers");
    const adminCollection = db.collection("admins");

    // Get monthly user creation data for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userTrends = await userCollection.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]).toArray();

    // Format data for last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const monthNum = date.getMonth() + 1;

      const monthData = userTrends.find(t => 
        t._id.year === year && t._id.month === monthNum
      );

      // Get total active users up to this month
      const totalOrgUsers = await userCollection.countDocuments({
        isActive: true,
        createdAt: { $lte: new Date(year, monthNum - 1, 28) }
      });

      const totalAdmins = await adminCollection.countDocuments({
        isActive: true,
        createdAt: { $lte: new Date(year, monthNum - 1, 28) }
      });

      months.push({
        month,
        activeUsers: totalOrgUsers,
        admins: totalAdmins,
        newUsers: monthData?.count || 0
      });
    }

    return months;
  }

  // ============= COMPLETE DASHBOARD OVERVIEW =============
  async getCompleteOverview() {
    const [organizations, bloodStock, alerts, users, recentActivity, health] = await Promise.all([
      this.getOrganizationStats(),
      this.getBloodStockStats(),
      this.getAlertStats(),
      this.getUserStats(),
      this.getRecentActivity(10),
      this.getSystemHealth()
    ]);

    return {
      timestamp: new Date(),
      organizations,
      bloodStock,
      alerts,
      users,
      recentActivity,
      health
    };
  }
}

export default new Dashboard();
