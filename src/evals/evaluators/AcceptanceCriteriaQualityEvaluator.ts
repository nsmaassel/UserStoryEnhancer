import { Evaluator, EvalResult, EnhancedUserStoryOutput } from '../types';

export class AcceptanceCriteriaQualityEvaluator implements Evaluator {
  name = 'AcceptanceCriteriaQuality';
  description = 'Evaluates the quality of acceptance criteria based on SMART principles and testability';

  async evaluate(input: string, output: EnhancedUserStoryOutput): Promise<EvalResult> {
    const criteria = output.acceptanceCriteria || [];
    const issues = [];
    let score = 1.0;

    if (criteria.length === 0) {
      return {
        score: 0,
        passed: false,
        details: 'No acceptance criteria provided',
        metadata: { criteriaCount: 0 },
      };
    }

    // Check minimum number of criteria
    if (criteria.length < 1) {
      issues.push('Should have at least 1 acceptance criterion');
      score -= 0.3;
    }

    // Check if criteria are too few or too many
    if (criteria.length > 7) {
      issues.push('Too many acceptance criteria (may indicate multiple requirements)');
      score -= 0.2;
    }

    let specificCount = 0;
    let measurableCount = 0;
    let testableCount = 0;

    for (const criterion of criteria) {
      const lowerCriterion = criterion.toLowerCase();

      // Check for Given-When-Then structure (indicates testability)
      const hasGivenWhenThen = /given|when|then/.test(lowerCriterion);
      if (hasGivenWhenThen) {
        testableCount++;
      }

      // Check for specific actions/conditions
      const hasSpecificActions = /click|enter|select|submit|display|show|redirect|validate|login|logout/.test(lowerCriterion);
      if (hasSpecificActions) {
        specificCount++;
      }

      // Check for measurable outcomes
      const hasMeasurableOutcomes = /should|must|will|can|page|button|field|message|error|success/.test(lowerCriterion);
      if (hasMeasurableOutcomes) {
        measurableCount++;
      }

      // Check if criteria are too vague
      if (criterion.length < 20) {
        issues.push(`Criterion too short/vague: "${criterion}"`);
        score -= 0.1;
      }
    }

    // Score based on SMART criteria adherence
    const specificityScore = specificCount / criteria.length;
    const measurabilityScore = measurableCount / criteria.length;
    const testabilityScore = testableCount / criteria.length;

    if (specificityScore < 0.5) {
      issues.push('Many criteria lack specific actions or conditions');
      score -= 0.2;
    }

    if (measurabilityScore < 0.5) {
      issues.push('Many criteria lack measurable outcomes');
      score -= 0.2;
    }

    if (testabilityScore < 0.3) {
      issues.push('Few criteria follow testable Given-When-Then structure');
      score -= 0.3;
    }

    score = Math.max(0, score);
    const passed = score >= 0.6;

    return {
      score,
      passed,
      details: issues.length > 0 ? issues.join('; ') : 'Acceptance criteria are well-structured and testable',
      metadata: {
        criteriaCount: criteria.length,
        specificityScore,
        measurabilityScore,
        testabilityScore,
        avgLength: criteria.reduce((sum, c) => sum + c.length, 0) / criteria.length,
      },
    };
  }
}