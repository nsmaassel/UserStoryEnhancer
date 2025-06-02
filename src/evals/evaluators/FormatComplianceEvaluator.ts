import { Evaluator, EvalResult, EnhancedUserStoryOutput } from '../types';

export class FormatComplianceEvaluator implements Evaluator {
  name = 'FormatCompliance';
  description = 'Checks if the output matches the expected JSON format with required fields';

  async evaluate(input: string, output: EnhancedUserStoryOutput): Promise<EvalResult> {
    const issues = [];
    let score = 1.0;

    // Check if userStory exists and is a string
    if (!output.userStory || typeof output.userStory !== 'string') {
      issues.push('Missing or invalid userStory field');
      score -= 0.5;
    }

    // Check if acceptanceCriteria exists and is an array
    if (!output.acceptanceCriteria || !Array.isArray(output.acceptanceCriteria)) {
      issues.push('Missing or invalid acceptanceCriteria field');
      score -= 0.5;
    } else if (output.acceptanceCriteria.length === 0) {
      issues.push('Empty acceptanceCriteria array');
      score -= 0.3;
    } else {
      // Check if all acceptance criteria are strings
      const invalidCriteria = output.acceptanceCriteria.filter(
        criteria => typeof criteria !== 'string' || criteria.trim() === ''
      );
      if (invalidCriteria.length > 0) {
        issues.push(`${invalidCriteria.length} invalid acceptance criteria (empty or non-string)`);
        score -= 0.3;
      }
    }

    score = Math.max(0, score);
    const passed = score >= 0.8;

    return {
      score,
      passed,
      details: issues.length > 0 ? issues.join('; ') : 'Format is compliant',
      metadata: {
        hasUserStory: !!output.userStory,
        hasAcceptanceCriteria: !!output.acceptanceCriteria,
        acceptanceCriteriaCount: output.acceptanceCriteria?.length || 0,
      },
    };
  }
}