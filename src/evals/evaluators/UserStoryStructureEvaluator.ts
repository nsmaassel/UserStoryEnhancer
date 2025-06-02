import { Evaluator, EvalResult, EnhancedUserStoryOutput } from '../types';

export class UserStoryStructureEvaluator implements Evaluator {
  name = 'UserStoryStructure';
  description = 'Evaluates if the user story follows the standard "As a... I want... So that..." structure';

  async evaluate(input: string, output: EnhancedUserStoryOutput): Promise<EvalResult> {
    const userStory = output.userStory?.toLowerCase() || '';
    const issues = [];
    let score = 1.0;

    // Check for "As a" pattern
    const hasAsA = /as\s+a\s+\w+/.test(userStory);
    if (!hasAsA) {
      issues.push('Missing "As a [role]" component');
      score -= 0.4;
    }

    // Check for "I want" pattern
    const hasIWant = /i\s+want|i\s+need|i\s+would\s+like/.test(userStory);
    if (!hasIWant) {
      issues.push('Missing "I want/need" component');
      score -= 0.4;
    }

    // Check for "So that" pattern (goal/benefit)
    const hasSoThat = /so\s+that|in\s+order\s+to|to\s+be\s+able\s+to/.test(userStory);
    if (!hasSoThat) {
      issues.push('Missing "So that/In order to" benefit component');
      score -= 0.4; // Increased penalty to ensure it fails
    }

    // Check if it's too short to be meaningful
    if (userStory.length < 20) {
      issues.push('User story is too short to be meaningful');
      score -= 0.3;
    }

    // Check if it's enhanced compared to input
    const isEnhanced = output.userStory.length > input.length * 0.8; // Should be roughly same length or longer
    if (!isEnhanced) {
      issues.push('Story may not be properly enhanced (too short compared to input)');
      score -= 0.2;
    }

    score = Math.max(0, score);
    const passed = score >= 0.7; // Lowered threshold slightly

    return {
      score,
      passed,
      details: issues.length > 0 ? issues.join('; ') : 'User story structure is well-formed',
      metadata: {
        hasAsA,
        hasIWant,
        hasSoThat,
        length: output.userStory.length,
        inputLength: input.length,
      },
    };
  }
}