import { UserStoryStructureEvaluator } from '../evaluators/UserStoryStructureEvaluator';
import { EnhancedUserStoryOutput } from '../types';

describe('UserStoryStructureEvaluator', () => {
  const evaluator = new UserStoryStructureEvaluator();

  it('should pass for well-structured user story', async () => {
    const goodOutput: EnhancedUserStoryOutput = {
      userStory: 'As a customer, I want to view my order history so that I can track my purchases and returns.',
      acceptanceCriteria: ['Some criteria'],
    };

    const result = await evaluator.evaluate('As a user, I want to see orders', goodOutput);

    expect(result.passed).toBe(true);
    expect(result.score).toBeGreaterThan(0.7);
    expect(result.metadata.hasAsA).toBe(true);
    expect(result.metadata.hasIWant).toBe(true);
    expect(result.metadata.hasSoThat).toBe(true);
  });

  it('should fail for missing "As a" component', async () => {
    const badOutput: EnhancedUserStoryOutput = {
      userStory: 'I want to view my order history so that I can track my purchases.',
      acceptanceCriteria: ['Some criteria'],
    };

    const result = await evaluator.evaluate('input', badOutput);

    expect(result.passed).toBe(false);
    expect(result.details).toContain('Missing "As a [role]" component');
    expect(result.metadata.hasAsA).toBe(false);
  });

  it('should fail for missing "I want" component', async () => {
    const badOutput: EnhancedUserStoryOutput = {
      userStory: 'As a customer, to view my order history so that I can track my purchases.',
      acceptanceCriteria: ['Some criteria'],
    };

    const result = await evaluator.evaluate('input', badOutput);

    expect(result.passed).toBe(false);
    expect(result.details).toContain('Missing "I want/need" component');
    expect(result.metadata.hasIWant).toBe(false);
  });

  it('should fail for missing "So that" component', async () => {
    const badOutput: EnhancedUserStoryOutput = {
      userStory: 'As a customer, I want to view my order history.',
      acceptanceCriteria: ['Some criteria'],
    };

    const result = await evaluator.evaluate('input', badOutput);

    expect(result.score).toBeLessThan(0.7); // Should be 0.6 now
    expect(result.details).toContain('Missing "So that/In order to" benefit component');
    expect(result.metadata.hasSoThat).toBe(false);
  });

  it('should detect alternative phrasing', async () => {
    const alternativeOutput: EnhancedUserStoryOutput = {
      userStory: 'As a user, I need to be able to reset my password in order to regain access to my account.',
      acceptanceCriteria: ['Some criteria'],
    };

    const result = await evaluator.evaluate('input', alternativeOutput);

    expect(result.metadata.hasIWant).toBe(true); // "I need" should be detected
    expect(result.metadata.hasSoThat).toBe(true); // "in order to" should be detected
  });
});