import { FormatComplianceEvaluator } from '../evaluators/FormatComplianceEvaluator';
import { EnhancedUserStoryOutput } from '../types';

describe('FormatComplianceEvaluator', () => {
  const evaluator = new FormatComplianceEvaluator();

  it('should pass for valid format', async () => {
    const validOutput: EnhancedUserStoryOutput = {
      userStory: 'As a user, I want to log in so that I can access my account.',
      acceptanceCriteria: [
        'Given I am on the login page, when I enter valid credentials, then I should be logged in.',
        'Given I enter invalid credentials, when I click login, then I should see an error message.',
      ],
    };

    const result = await evaluator.evaluate('input', validOutput);

    expect(result.passed).toBe(true);
    expect(result.score).toBe(1.0);
    expect(result.details).toBe('Format is compliant');
  });

  it('should fail for missing userStory', async () => {
    const invalidOutput: EnhancedUserStoryOutput = {
      userStory: '',
      acceptanceCriteria: ['Some criteria'],
    };

    const result = await evaluator.evaluate('input', invalidOutput);

    expect(result.passed).toBe(false);
    expect(result.score).toBeLessThan(0.8);
    expect(result.details).toContain('Missing or invalid userStory field');
  });

  it('should fail for missing acceptanceCriteria', async () => {
    const invalidOutput: EnhancedUserStoryOutput = {
      userStory: 'Valid user story',
      acceptanceCriteria: [],
    };

    const result = await evaluator.evaluate('input', invalidOutput);

    expect(result.passed).toBe(false);
    expect(result.score).toBeLessThan(0.8);
  });

  it('should detect empty acceptance criteria', async () => {
    const invalidOutput: EnhancedUserStoryOutput = {
      userStory: 'Valid user story',
      acceptanceCriteria: ['Valid criteria', '', 'Another valid criteria'],
    };

    const result = await evaluator.evaluate('input', invalidOutput);

    expect(result.passed).toBe(false);
    expect(result.details).toContain('invalid acceptance criteria');
  });
});