import { AcceptanceCriteriaQualityEvaluator } from '../evaluators/AcceptanceCriteriaQualityEvaluator';
import { EnhancedUserStoryOutput } from '../types';

describe('AcceptanceCriteriaQualityEvaluator', () => {
  const evaluator = new AcceptanceCriteriaQualityEvaluator();

  it('should pass for high-quality acceptance criteria', async () => {
    const goodOutput: EnhancedUserStoryOutput = {
      userStory: 'Some story',
      acceptanceCriteria: [
        'Given I am on the login page, when I enter valid credentials and click submit, then I should be redirected to the dashboard.',
        'Given I am on the login page, when I enter invalid credentials and click submit, then I should see an error message.',
        'Given I am logged in, when I click logout, then I should be redirected to the login page.',
      ],
    };

    const result = await evaluator.evaluate('input', goodOutput);

    expect(result.passed).toBe(true);
    expect(result.score).toBeGreaterThan(0.6);
    expect(result.metadata.testabilityScore).toBeGreaterThan(0.5);
  });

  it('should fail for no acceptance criteria', async () => {
    const badOutput: EnhancedUserStoryOutput = {
      userStory: 'Some story',
      acceptanceCriteria: [],
    };

    const result = await evaluator.evaluate('input', badOutput);

    expect(result.passed).toBe(false);
    expect(result.score).toBe(0);
    expect(result.details).toBe('No acceptance criteria provided');
  });

  it('should detect vague criteria', async () => {
    const vagueOutput: EnhancedUserStoryOutput = {
      userStory: 'Some story',
      acceptanceCriteria: [
        'It works',
        'User is happy',
        'System responds',
      ],
    };

    const result = await evaluator.evaluate('input', vagueOutput);

    expect(result.passed).toBe(false);
    expect(result.details).toContain('Criterion too short/vague');
  });

  it('should reward Given-When-Then structure', async () => {
    const gwtOutput: EnhancedUserStoryOutput = {
      userStory: 'Some story',
      acceptanceCriteria: [
        'Given I am on the page, when I click button, then I see result',
        'Just a regular criterion without GWT structure',
      ],
    };

    const result = await evaluator.evaluate('input', gwtOutput);

    expect(result.metadata.testabilityScore).toBe(0.5); // 1 out of 2 criteria has GWT
  });

  it('should detect specific actions and measurable outcomes', async () => {
    const specificOutput: EnhancedUserStoryOutput = {
      userStory: 'Some story',
      acceptanceCriteria: [
        'User can click the submit button and see a success message displayed on the page',
        'When user enters data in the field, the form should validate and show error messages',
      ],
    };

    const result = await evaluator.evaluate('input', specificOutput);

    expect(result.metadata.specificityScore).toBeGreaterThan(0.5);
    expect(result.metadata.measurabilityScore).toBeGreaterThan(0.5);
  });
});