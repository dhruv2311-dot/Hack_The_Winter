/**
 * Urgency Calculator
 * 
 * Automatically calculates urgency level based on patient details
 * No manual selection required
 */

class UrgencyCalculator {
  /**
   * Calculate urgency based on patient and context details
   * 
   * @param {Object} data - Request data
   * @param {number} data.patientAge - Patient age in years
   * @param {string} data.patientCondition - Patient condition (Critical, Severe, Moderate, Stable)
   * @param {string} data.department - Department/Ward
   * @param {number} data.unitsRequired - Blood units needed
   * @returns {Object} { urgency, priority, score, reason }
   */
  static calculateUrgency(data) {
    const { patientAge, patientCondition, department, unitsRequired } = data;

    let score = 0;
    let factors = [];

    // 1. CONDITION SEVERITY (0-100 points)
    const conditionScores = {
      "Critical": 100,
      "Severe": 75,
      "Moderate": 50,
      "Stable": 25
    };
    const conditionScore = conditionScores[patientCondition] || 25;
    score += conditionScore;
    if (conditionScore >= 75) {
      factors.push(`Critical condition (${patientCondition})`);
    }

    // 2. DEPARTMENT RISK (0-80 points)
    const departmentScores = {
      "ICU": 80,
      "Emergency": 75,
      "Operation Theatre": 70,
      "Cardiology": 60,
      "Trauma": 80,
      "General Ward": 30,
      "Other": 40
    };
    const deptScore = departmentScores[department] || 30;
    score += deptScore;
    if (deptScore >= 70) {
      factors.push(`High-risk department (${department})`);
    }

    // 3. PATIENT AGE (0-40 points)
    // Very old (>70) or very young (<5) = higher risk
    let ageScore = 0;
    if (patientAge < 5) {
      ageScore = 40;
      factors.push("Very young patient (<5 years)");
    } else if (patientAge > 70) {
      ageScore = 35;
      factors.push("Elderly patient (>70 years)");
    } else if (patientAge < 18) {
      ageScore = 30;
      factors.push("Pediatric patient");
    } else if (patientAge > 60) {
      ageScore = 20;
    } else {
      ageScore = 10;
    }
    score += ageScore;

    // 4. BLOOD QUANTITY NEEDED (0-30 points)
    let quantityScore = 0;
    if (unitsRequired >= 8) {
      quantityScore = 30;
      factors.push(`Large quantity required (${unitsRequired} units)`);
    } else if (unitsRequired >= 5) {
      quantityScore = 20;
    } else if (unitsRequired >= 3) {
      quantityScore = 10;
    } else {
      quantityScore = 5;
    }
    score += quantityScore;

    // Determine urgency category based on total score
    let urgency, priority;
    if (score >= 240) {
      urgency = "CRITICAL";
      priority = 1;
    } else if (score >= 180) {
      urgency = "HIGH";
      priority = 2;
    } else if (score >= 100) {
      urgency = "MEDIUM";
      priority = 3;
    } else {
      urgency = "LOW";
      priority = 4;
    }

    return {
      urgency,
      priority,
      score: Math.round(score),
      factors,
      calculation: {
        conditionScore,
        departmentScore: deptScore,
        ageScore,
        quantityScore,
        totalScore: Math.round(score)
      }
    };
  }

  /**
   * Get urgency description for display
   */
  static getUrgencyDescription(urgency) {
    const descriptions = {
      "CRITICAL": {
        label: "CRITICAL 🔴",
        description: "Immediate intervention required",
        color: "red"
      },
      "HIGH": {
        label: "HIGH 🟠",
        description: "Urgent - respond within 15 minutes",
        color: "orange"
      },
      "MEDIUM": {
        label: "MEDIUM 🟡",
        description: "Standard - respond within 1 hour",
        color: "yellow"
      },
      "LOW": {
        label: "LOW 🟢",
        description: "Routine - respond within 4 hours",
        color: "green"
      }
    };
    return descriptions[urgency] || descriptions["MEDIUM"];
  }
}

export default UrgencyCalculator;
