/**
 * Priority Calculator Service
 * Calculates priority scores for emergency blood requests
 * 
 * Formula: Priority Score = (Urgency × 0.40) + (Rarity × 0.30) + (Time × 0.20) + (Availability × 0.10)
 * 
 * Score Range: 0-255
 * Categories:
 *   CRITICAL: 180-255 (immediate action required)
 *   HIGH: 140-179 (urgent action needed)
 *   MEDIUM: 80-139 (standard processing)
 *   LOW: 0-79 (routine processing)
 */

class PriorityCalculator {
  // ============= SCORING WEIGHTS =============
  
  static URGENCY_SCORES = {
    CRITICAL: 100,  // Life-threatening, immediate need
    HIGH: 75,       // Serious condition, needed within hours
    MEDIUM: 50,     // Moderate condition, routine processing
    LOW: 25         // Elective or planned procedure
  };

  static BLOOD_RARITY_SCORES = {
    'AB-': 100,  // Rarest universal donor
    'B-': 90,
    'A-': 80,
    'AB+': 70,   // Rare but positive
    'A+': 60,
    'B+': 50,
    'O-': 40,    // Universal donor (negative)
    'O+': 30     // Most common (about 37% of population)
  };

  // Weighting factors
  static URGENCY_WEIGHT = 0.40;      // 40% of priority
  static RARITY_WEIGHT = 0.30;       // 30% of priority
  static TIME_WEIGHT = 0.20;         // 20% of priority
  static AVAILABILITY_WEIGHT = 0.10; // 10% of priority

  // Time factor calculation
  static MAX_TIME_SCORE = 100;       // Maximum points from time factor
  static HOURS_TO_MAX_TIME = 10;     // Points increase over 10 hours
  static POINTS_PER_MINUTE = (100) / (10 * 60); // ~0.167 points per minute

  // Availability factor calculation
  static MIN_SAFE_STOCK_LEVELS = {
    'AB-': 10,  // Rarest types need higher minimum
    'B-': 15,
    'A-': 15,
    'AB+': 20,
    'A+': 30,
    'B+': 30,
    'O-': 20,
    'O+': 50    // Most common, should keep high stock
  };

  static MAX_AVAILABILITY_SCORE = 100;

  // ============= PRIORITY CALCULATION METHODS =============

  /**
   * Main method: Calculate priority score for a request
   * @param {Object} request - Blood request object
   * @param {string} request.urgency - CRITICAL|HIGH|MEDIUM|LOW
   * @param {string} request.bloodGroup - Blood type (O+, AB-, etc)
   * @param {Date} request.createdAt - Request creation time
   * @param {Date} request.requiredBy - When blood is needed by (optional)
   * @param {number} currentBloodAvailability - Units available of this type
   * @returns {Object} { score, category, breakdown, details }
   */
  static calculatePriority(request, currentBloodAvailability = 0) {
    if (!request || !request.urgency || !request.bloodGroup) {
      throw new Error('Invalid request data for priority calculation. Required: urgency, bloodGroup, createdAt');
    }

    // Calculate component scores
    const urgencyScore = this.getUrgencyScore(request.urgency);
    const rarityScore = this.getRarityScore(request.bloodGroup);
    const timeScore = this.getTimeScore(request.createdAt, request.requiredBy);
    const availabilityScore = this.getAvailabilityScore(request.bloodGroup, currentBloodAvailability);

    // Calculate weighted total
    const weightedTotal = 
      (urgencyScore * this.URGENCY_WEIGHT) +
      (rarityScore * this.RARITY_WEIGHT) +
      (timeScore * this.TIME_WEIGHT) +
      (availabilityScore * this.AVAILABILITY_WEIGHT);

    // Cap at maximum
    const finalScore = Math.min(Math.round(weightedTotal), 255);

    // Categorize
    const category = this.categorizePriority(finalScore);

    return {
      score: finalScore,
      category: category,
      breakdown: {
        urgency: {
          raw: urgencyScore,
          weighted: Math.round(urgencyScore * this.URGENCY_WEIGHT),
          label: request.urgency,
          weight: this.URGENCY_WEIGHT
        },
        rarity: {
          raw: rarityScore,
          weighted: Math.round(rarityScore * this.RARITY_WEIGHT),
          label: request.bloodGroup,
          weight: this.RARITY_WEIGHT
        },
        time: {
          raw: timeScore,
          weighted: Math.round(timeScore * this.TIME_WEIGHT),
          minutesOld: Math.round((Date.now() - new Date(request.createdAt)) / 60000),
          weight: this.TIME_WEIGHT
        },
        availability: {
          raw: availabilityScore,
          weighted: Math.round(availabilityScore * this.AVAILABILITY_WEIGHT),
          currentUnits: currentBloodAvailability,
          minSafeLevel: this.MIN_SAFE_STOCK_LEVELS[request.bloodGroup] || 20,
          weight: this.AVAILABILITY_WEIGHT
        }
      },
      details: {
        requestId: request._id || null,
        bloodGroup: request.bloodGroup,
        urgency: request.urgency,
        createdAt: request.createdAt,
        calculatedAt: new Date()
      }
    };
  }

  /**
   * Get urgency score (0-100)
   */
  static getUrgencyScore(urgency) {
    return this.URGENCY_SCORES[urgency] || this.URGENCY_SCORES.MEDIUM;
  }

  /**
   * Get rarity score (0-100) based on blood type prevalence
   * Rarer blood types = higher score
   */
  static getRarityScore(bloodGroup) {
    return this.BLOOD_RARITY_SCORES[bloodGroup] || 50; // Default to medium if unknown
  }

  /**
   * Get time score (0-100)
   * Older requests get higher score
   * Maximum score reached after HOURS_TO_MAX_TIME
   */
  static getTimeScore(createdAt, requiredBy = null) {
    const createdDate = new Date(createdAt);
    const minutesOld = (Date.now() - createdDate.getTime()) / 60000;

    // If there's a "required by" time, prioritize based on urgency of deadline
    if (requiredBy) {
      const requiredByDate = new Date(requiredBy);
      const minutesUntilDeadline = (requiredByDate.getTime() - Date.now()) / 60000;

      // If already past deadline, maximum score
      if (minutesUntilDeadline < 0) {
        return this.MAX_TIME_SCORE;
      }

      // Score based on how close to deadline (inverse relationship)
      // Less time remaining = higher score
      const hoursUntilDeadline = minutesUntilDeadline / 60;
      const timeScore = this.MAX_TIME_SCORE * Math.exp(-0.3 * Math.max(hoursUntilDeadline, 0));
      return Math.min(timeScore, this.MAX_TIME_SCORE);
    }

    // Otherwise, score based on age (how long waiting)
    const timeScore = minutesOld * this.POINTS_PER_MINUTE;
    return Math.min(timeScore, this.MAX_TIME_SCORE);
  }

  /**
   * Get availability score (0-100)
   * Critical shortage = higher score
   * Adequate stock = lower score
   */
  static getAvailabilityScore(bloodGroup, currentUnits) {
    const minSafeLevel = this.MIN_SAFE_STOCK_LEVELS[bloodGroup] || 20;

    // If we have adequate stock, no availability penalty
    if (currentUnits >= minSafeLevel) {
      return 0;
    }

    // If stock is critically low, higher score
    const deficit = minSafeLevel - currentUnits;
    const availabilityScore = (deficit / minSafeLevel) * this.MAX_AVAILABILITY_SCORE;

    return Math.min(availabilityScore, this.MAX_AVAILABILITY_SCORE);
  }

  /**
   * Categorize priority based on score
   */
  static categorizePriority(score) {
    if (score >= 180) return 'CRITICAL';
    if (score >= 140) return 'HIGH';
    if (score >= 80) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Get category details for display
   */
  static getCategoryDetails(category) {
    const details = {
      CRITICAL: {
        color: 'red',
        icon: '🔴',
        emoji: '🚨',
        label: 'CRITICAL',
        actionRequired: 'Immediate action - escalate now',
        responseTime: '< 5 minutes'
      },
      HIGH: {
        color: 'orange',
        icon: '🟠',
        emoji: '⚠️',
        label: 'HIGH',
        actionRequired: 'Urgent - process immediately',
        responseTime: '5-15 minutes'
      },
      MEDIUM: {
        color: 'yellow',
        icon: '🟡',
        emoji: '📌',
        label: 'MEDIUM',
        actionRequired: 'Standard - process normally',
        responseTime: '15-45 minutes'
      },
      LOW: {
        color: 'green',
        icon: '🟢',
        emoji: '✅',
        label: 'LOW',
        actionRequired: 'Routine - can be scheduled',
        responseTime: '> 45 minutes'
      }
    };

    return details[category] || details.MEDIUM;
  }

  /**
   * Sort requests by priority (highest first)
   */
  static sortByPriority(requests) {
    return requests.sort((a, b) => {
      // Sort by priority score (descending)
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }
      // If same priority, sort by creation time (older first)
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  }

  /**
   * Filter requests by priority category
   */
  static filterByCategory(requests, category) {
    return requests.filter(r => r.priorityCategory === category);
  }

  /**
   * Get priority statistics
   */
  static getPriorityStats(requests) {
    const stats = {
      total: requests.length,
      byCategory: {
        CRITICAL: 0,
        HIGH: 0,
        MEDIUM: 0,
        LOW: 0
      },
      byUrgency: {
        CRITICAL: 0,
        HIGH: 0,
        MEDIUM: 0,
        LOW: 0
      },
      averageScore: 0,
      averageAge: 0
    };

    if (requests.length === 0) {
      return stats;
    }

    let totalScore = 0;
    let totalAge = 0;

    requests.forEach(req => {
      if (req.priorityCategory) {
        stats.byCategory[req.priorityCategory]++;
      }
      if (req.urgency) {
        stats.byUrgency[req.urgency]++;
      }
      totalScore += req.priorityScore || 0;
      totalAge += (Date.now() - new Date(req.createdAt)) / 60000 || 0; // in minutes
    });

    stats.averageScore = Math.round(totalScore / requests.length);
    stats.averageAge = Math.round(totalAge / requests.length);

    return stats;
  }

  /**
   * Validate urgency level
   */
  static isValidUrgency(urgency) {
    return Object.keys(this.URGENCY_SCORES).includes(urgency);
  }

  /**
   * Validate blood group
   */
  static isValidBloodGroup(bloodGroup) {
    return Object.keys(this.BLOOD_RARITY_SCORES).includes(bloodGroup);
  }

  /**
   * Get all valid urgency levels
   */
  static getValidUrgencies() {
    return Object.keys(this.URGENCY_SCORES);
  }

  /**
   * Get all valid blood groups
   */
  static getValidBloodGroups() {
    return Object.keys(this.BLOOD_RARITY_SCORES);
  }

  /**
   * Recalculate priority for existing request
   * Useful when blood availability changes or time has passed
   */
  static recalculatePriority(request, currentBloodAvailability = 0) {
    return this.calculatePriority(request, currentBloodAvailability);
  }

  /**
   * Get priority score distribution for analytics
   */
  static getScoreDistribution(requests, bucketSize = 20) {
    const buckets = {};
    
    for (let i = 0; i <= 255; i += bucketSize) {
      buckets[`${i}-${i + bucketSize - 1}`] = 0;
    }

    requests.forEach(req => {
      const score = req.priorityScore || 0;
      const bucket = Math.floor(score / bucketSize) * bucketSize;
      const bucketLabel = `${bucket}-${bucket + bucketSize - 1}`;
      if (buckets[bucketLabel] !== undefined) {
        buckets[bucketLabel]++;
      }
    });

    return buckets;
  }
}

export default PriorityCalculator;
