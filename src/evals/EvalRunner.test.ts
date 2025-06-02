import { EvalRunner } from './EvalRunner';
import { createBasicEvalSuite } from './suites/index';
import { mock } from 'jest-mock-extended';
import { OpenAI } from '@langchain/openai';

// Mock the enhance logic
jest.mock('../logic/EnhanceUserStoryLogic');

describe('EvalRunner', () => {
  const mockApiKey = 'test-api-key';
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  it('should run evaluation suite and generate report', async () => {
    // Mock the enhance logic to return predictable output
    const { enhanceUserStoryLogic } = require('../logic/EnhanceUserStoryLogic');
    enhanceUserStoryLogic.mockResolvedValue(JSON.stringify({
      userStory: 'As a test user, I want to perform test actions so that I can achieve test goals.',
      acceptanceCriteria: [
        'Given I am testing, when I perform action, then I see expected result.',
      ],
    }));

    const runner = new EvalRunner(mockApiKey);
    const suite = createBasicEvalSuite();

    const report = await runner.runEvalSuite(suite);

    expect(report).toBeDefined();
    expect(report.suiteId).toBe(suite.name);
    expect(report.summary.totalCases).toBe(suite.cases.length);
    expect(report.summary.totalEvaluators).toBe(suite.evaluators.length);
    expect(report.results).toHaveLength(suite.cases.length);
    
    // Each result should have evaluator results
    report.results.forEach(result => {
      expect(result.evaluatorResults).toHaveLength(suite.evaluators.length);
      result.evaluatorResults.forEach(evalResult => {
        expect(evalResult.result).toHaveProperty('score');
        expect(evalResult.result).toHaveProperty('passed');
        expect(evalResult.result).toHaveProperty('details');
      });
    });
  });

  it('should handle enhancement failures gracefully', async () => {
    // Mock the enhance logic to fail
    const { enhanceUserStoryLogic } = require('../logic/EnhanceUserStoryLogic');
    enhanceUserStoryLogic.mockRejectedValue(new Error('Enhancement failed'));

    const runner = new EvalRunner(mockApiKey);
    const suite = createBasicEvalSuite();

    const report = await runner.runEvalSuite(suite);

    expect(report).toBeDefined();
    expect(report.summary.passRate).toBe(0); // All should fail
    
    // Check that failure is properly recorded
    report.results.forEach(result => {
      result.evaluatorResults.forEach(evalResult => {
        expect(evalResult.result.passed).toBe(false);
        expect(evalResult.result.details).toContain('Enhancement failed');
      });
    });
  });

  it('should calculate summary statistics correctly', async () => {
    // Mock successful enhancement with good quality output
    const { enhanceUserStoryLogic } = require('../logic/EnhanceUserStoryLogic');
    enhanceUserStoryLogic.mockResolvedValue(JSON.stringify({
      userStory: 'As a well-structured user, I want to perform clear actions so that I can achieve specific goals.',
      acceptanceCriteria: [
        'Given I have clear requirements, when I interact with the system, then I should see expected behavior.',
        'Given I submit valid data, when processing completes, then I should receive confirmation.',
      ],
    }));

    const runner = new EvalRunner(mockApiKey);
    const suite = createBasicEvalSuite();

    const report = await runner.runEvalSuite(suite);

    expect(report.summary.overallScore).toBeGreaterThan(0);
    expect(report.summary.overallScore).toBeLessThanOrEqual(1);
    expect(report.summary.passRate).toBeGreaterThanOrEqual(0);
    expect(report.summary.passRate).toBeLessThanOrEqual(1);
  });
});