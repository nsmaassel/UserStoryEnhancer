import {
  EvalRunner,
  createBasicEvalSuite,
  createStandardEvalSuite,
  EvalReportUtils,
  sampleEvalCases,
} from './index';

// Mock the enhance logic
jest.mock('../logic/EnhanceUserStoryLogic');

describe('Evaluation Framework Integration Tests', () => {
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should run complete evaluation workflow', async () => {
    // Mock successful enhancement
    const { enhanceUserStoryLogic } = require('../logic/EnhanceUserStoryLogic');
    enhanceUserStoryLogic.mockResolvedValue(JSON.stringify({
      userStory: 'As a user, I want to perform specific actions so that I can achieve clear goals.',
      acceptanceCriteria: [
        'Given I have proper access, when I click the action button, then I should see the expected result.',
        'Given I am on the correct page, when I submit valid data, then the system should process it successfully.',
      ],
    }));

    const runner = new EvalRunner(mockApiKey);
    const suite = createBasicEvalSuite();
    const report = await runner.runEvalSuite(suite);

    // Verify report structure
    expect(report.suiteId).toBe(suite.name);
    expect(report.results).toHaveLength(suite.cases.length);
    expect(report.summary.totalCases).toBe(suite.cases.length);
    expect(report.summary.totalEvaluators).toBe(suite.evaluators.length);

    // Test report formatting
    const formattedReport = EvalReportUtils.formatReport(report);
    expect(formattedReport).toContain('Evaluation Report');
    expect(formattedReport).toContain('Overall Score');
    expect(formattedReport).toContain('Pass Rate');

    // Test evaluator summary
    const evaluatorSummary = EvalReportUtils.getEvaluatorSummary(report);
    expect(Object.keys(evaluatorSummary)).toHaveLength(suite.evaluators.length);
    
    for (const [name, stats] of Object.entries(evaluatorSummary)) {
      expect(typeof stats.avgScore).toBe('number');
      expect(stats.avgScore).toBeGreaterThanOrEqual(0);
      expect(stats.avgScore).toBeLessThanOrEqual(1);
      expect(stats.passRate).toBeGreaterThanOrEqual(0);
      expect(stats.passRate).toBeLessThanOrEqual(1);
      expect(stats.totalRuns).toBe(suite.cases.length);
    }

    // Test CSV export
    const csvData = EvalReportUtils.toCSV(report);
    expect(csvData).toContain('Case ID,Case Name');
    expect(csvData.split('\n')).toHaveLength(1 + (suite.cases.length * suite.evaluators.length)); // header + data rows

    // Test failure analysis
    const failures = EvalReportUtils.findFailures(report);
    expect(Array.isArray(failures)).toBe(true);
  });

  it('should handle different suite types', async () => {
    const { enhanceUserStoryLogic } = require('../logic/EnhanceUserStoryLogic');
    enhanceUserStoryLogic.mockResolvedValue(JSON.stringify({
      userStory: 'As a user, I want to do something so that I get value.',
      acceptanceCriteria: ['Some criterion'],
    }));

    const runner = new EvalRunner(mockApiKey);

    // Test basic suite
    const basicSuite = createBasicEvalSuite();
    const basicReport = await runner.runEvalSuite(basicSuite);
    expect(basicReport.suiteId).toBe('basic-compliance-suite');

    // Test standard suite
    const standardSuite = createStandardEvalSuite();
    const standardReport = await runner.runEvalSuite(standardSuite);
    expect(standardReport.suiteId).toBe('standard-quality-suite');
    
    // Standard suite should have more evaluators
    expect(standardReport.summary.totalEvaluators).toBeGreaterThan(basicReport.summary.totalEvaluators);
  });

  it('should properly identify and categorize failures', async () => {
    // Mock poor quality output
    const { enhanceUserStoryLogic } = require('../logic/EnhanceUserStoryLogic');
    enhanceUserStoryLogic.mockResolvedValue(JSON.stringify({
      userStory: 'Bad story without proper structure',
      acceptanceCriteria: ['Vague'],
    }));

    const runner = new EvalRunner(mockApiKey);
    const suite = createStandardEvalSuite();
    const report = await runner.runEvalSuite(suite);

    // Should have low scores due to poor quality
    expect(report.summary.overallScore).toBeLessThan(0.8);

    // Should identify specific failures
    const failures = EvalReportUtils.findFailures(report);
    expect(failures.length).toBeGreaterThan(0);

    // Test filtering by specific evaluator
    const structureFailures = EvalReportUtils.findFailures(report, 'UserStoryStructure');
    expect(Array.isArray(structureFailures)).toBe(true);
  });

  it('should validate sample evaluation cases', () => {
    // Ensure sample cases are well-formed
    expect(sampleEvalCases).toBeDefined();
    expect(sampleEvalCases.length).toBeGreaterThan(0);

    for (const evalCase of sampleEvalCases) {
      expect(evalCase.id).toBeTruthy();
      expect(evalCase.name).toBeTruthy();
      expect(evalCase.input).toBeTruthy();
      expect(evalCase.input.length).toBeGreaterThan(50); // Should meet minimum length
      expect(Array.isArray(evalCase.tags)).toBe(true);
    }
  });
});