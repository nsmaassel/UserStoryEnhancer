import { Evaluator, EvalResult, EnhancedUserStoryOutput } from '../types';

export class SingleRequirementEvaluator implements Evaluator {
  name = 'SingleRequirement';
  description = 'Evaluates if the enhanced user story focuses on a single requirement as instructed';

  async evaluate(input: string, output: EnhancedUserStoryOutput): Promise<EvalResult> {
    const userStory = output.userStory || '';
    const issues = [];
    let score = 1.0;

    // Check for multiple requirements indicators
    const multipleIndicators = [
      /\band\b.*\band\b/g, // Multiple "and" connectors
      /\bor\b/g, // Alternative requirements
      /\balso\b/g, // Additional requirements
      /\bplus\b/g, // Additional features
      /\badditionally\b/g, // Extra requirements
      /\bfurthermore\b/g, // More requirements
      /\bmoreover\b/g, // Additional aspects
    ];

    let indicatorCount = 0;
    for (const indicator of multipleIndicators) {
      const matches = userStory.match(indicator);
      if (matches) {
        indicatorCount += matches.length;
      }
    }

    if (indicatorCount > 2) {
      issues.push(`Multiple requirement indicators found (${indicatorCount})`);
      score -= 0.4;
    }

    // Check for multiple action verbs that might indicate multiple requirements
    const actionVerbs = ['want', 'need', 'can', 'able', 'access', 'view', 'create', 'update', 'delete', 'manage', 'configure'];
    let actionCount = 0;
    
    for (const verb of actionVerbs) {
      const regex = new RegExp(`\\b${verb}\\b`, 'gi');
      const matches = userStory.match(regex);
      if (matches) {
        actionCount += matches.length;
      }
    }

    if (actionCount > 3) {
      issues.push(`Multiple actions may indicate multiple requirements (${actionCount} action verbs)`);
      score -= 0.3;
    }

    // Check acceptance criteria for multiple requirements
    const criteria = output.acceptanceCriteria || [];
    if (criteria.length > 5) {
      issues.push(`High number of acceptance criteria (${criteria.length}) may indicate multiple requirements`);
      score -= 0.2;
    }

    // Look for conflicting or unrelated criteria topics
    const criteriaTopics = new Set();
    for (const criterion of criteria) {
      const words = criterion.toLowerCase().split(/\s+/);
      const keywords = words.filter(word => 
        word.length > 4 && 
        !['given', 'when', 'then', 'should', 'must', 'will', 'user', 'that'].includes(word)
      );
      
      keywords.forEach(keyword => criteriaTopics.add(keyword));
    }

    if (criteriaTopics.size > 8) {
      issues.push(`Wide range of topics in acceptance criteria (${criteriaTopics.size}) may indicate scope creep`);
      score -= 0.2;
    }

    score = Math.max(0, score);
    const passed = score >= 0.7;

    return {
      score,
      passed,
      details: issues.length > 0 ? issues.join('; ') : 'User story focuses on a single requirement',
      metadata: {
        multipleIndicatorCount: indicatorCount,
        actionVerbCount: actionCount,
        criteriaCount: criteria.length,
        uniqueTopicsCount: criteriaTopics.size,
      },
    };
  }
}