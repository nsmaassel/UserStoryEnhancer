# Evaluation Framework

This document describes the evaluation framework for measuring the quality of user story enhancement.

## Overview

The evaluation framework provides systematic quality measurement for AI-enhanced user stories through various evaluators that assess different aspects of output quality:

- **Format Compliance**: Ensures output matches expected JSON structure
- **User Story Structure**: Validates proper "As a... I want... So that..." format
- **Acceptance Criteria Quality**: Assesses SMART criteria and testability
- **Single Requirement**: Ensures focus on one requirement as instructed

## Quick Start

### Basic Usage

```typescript
import { EvalRunner, createBasicEvalSuite, EvalReportUtils } from './src/evals';

const runner = new EvalRunner(process.env.OPENAI_API_KEY);
const suite = createBasicEvalSuite();
const report = await runner.runEvalSuite(suite);

console.log(EvalReportUtils.formatReport(report));
```

### Running Evaluations

Use the provided example script:

```bash
# Set your OpenAI API key
export OPENAI_API_KEY=your_api_key_here

# Run evaluations
npx ts-node examples/runEvals.ts
```

## Available Evaluation Suites

### Basic Suite (`createBasicEvalSuite()`)
- **Purpose**: Fast compliance checking
- **Evaluators**: Format Compliance, User Story Structure
- **Use Case**: Quick validation, CI/CD integration

### Standard Suite (`createStandardEvalSuite()`)
- **Purpose**: Comprehensive quality assessment
- **Evaluators**: All evaluators (Format, Structure, Criteria Quality, Single Requirement)
- **Use Case**: Thorough quality analysis, performance monitoring

### Custom Suites
Create your own evaluation suites:

```typescript
import { EvalSuite, FormatComplianceEvaluator } from './src/evals';

const customSuite: EvalSuite = {
  name: 'my-custom-suite',
  description: 'Custom evaluation suite',
  cases: [
    {
      id: 'test-1',
      name: 'Test Case 1',
      input: 'As a user, I want to...',
      tags: ['custom'],
    }
  ],
  evaluators: [
    new FormatComplianceEvaluator(),
    // Add more evaluators
  ],
};
```

## Individual Evaluators

### FormatComplianceEvaluator
**Purpose**: Validates JSON structure and required fields

**Criteria**:
- ✅ `userStory` field exists and is non-empty string
- ✅ `acceptanceCriteria` field exists and is non-empty array
- ✅ All acceptance criteria are non-empty strings

**Scoring**:
- Missing userStory: -0.5 points
- Missing/invalid acceptanceCriteria: -0.5 points
- Empty acceptance criteria: -0.3 points
- **Pass threshold**: 0.8

### UserStoryStructureEvaluator
**Purpose**: Ensures proper user story format

**Criteria**:
- ✅ Contains "As a [role]" component
- ✅ Contains "I want/need/would like" component  
- ✅ Contains "So that/In order to" benefit component
- ✅ Sufficient length and enhancement

**Scoring**:
- Missing "As a": -0.4 points
- Missing "I want": -0.4 points
- Missing "So that": -0.4 points
- Too short: -0.3 points
- **Pass threshold**: 0.7

### AcceptanceCriteriaQualityEvaluator
**Purpose**: Assesses SMART criteria and testability

**Criteria**:
- ✅ Appropriate number of criteria (1-7)
- ✅ Specific actions and conditions
- ✅ Measurable outcomes
- ✅ Given-When-Then structure
- ✅ Sufficient detail (>20 characters each)

**Scoring**:
- Poor specificity: -0.2 points
- Poor measurability: -0.2 points
- Poor testability: -0.3 points
- Short/vague criteria: -0.1 per criterion
- **Pass threshold**: 0.6

### SingleRequirementEvaluator
**Purpose**: Ensures focus on single requirement

**Criteria**:
- ✅ Limited use of multiple requirement indicators ("and", "or", "also")
- ✅ Reasonable number of action verbs
- ✅ Focused acceptance criteria scope
- ✅ Coherent topic coverage

**Scoring**:
- Multiple indicators: -0.4 points
- Too many actions: -0.3 points
- Too many criteria: -0.2 points
- Wide topic range: -0.2 points
- **Pass threshold**: 0.7

## Report Analysis

### Understanding Reports

```typescript
const report = await runner.runEvalSuite(suite);

// Overall metrics
console.log(`Overall Score: ${(report.summary.overallScore * 100).toFixed(1)}%`);
console.log(`Pass Rate: ${(report.summary.passRate * 100).toFixed(1)}%`);

// Per-evaluator performance
const summary = EvalReportUtils.getEvaluatorSummary(report);
for (const [name, stats] of Object.entries(summary)) {
  console.log(`${name}: ${(stats.avgScore * 100).toFixed(1)}% avg`);
}

// Identify failures
const failures = EvalReportUtils.findFailures(report);
failures.forEach(failure => {
  console.log(`Failed case: ${failure.caseName}`);
  failure.failures.forEach(f => 
    console.log(`  ${f.evaluator}: ${f.reason}`)
  );
});
```

### Quality Thresholds

- **Excellent**: Overall Score ≥ 80% AND Pass Rate ≥ 80%
- **Good**: Overall Score ≥ 60% AND Pass Rate ≥ 60%
- **Needs Improvement**: Below good thresholds

## Integration Examples

### CI/CD Integration

```yaml
# .github/workflows/eval.yml
name: Quality Evaluation
on: [push, pull_request]

jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - run: npx ts-node examples/runEvals.ts
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

### Monitoring Dashboard

```typescript
// Regular monitoring
const monitor = async () => {
  const runner = new EvalRunner(apiKey);
  const report = await runner.runEvalSuite(createStandardEvalSuite());
  
  // Log to monitoring system
  metrics.gauge('user_story_quality.overall_score', report.summary.overallScore);
  metrics.gauge('user_story_quality.pass_rate', report.summary.passRate);
  
  // Alert on quality degradation
  if (report.summary.overallScore < 0.7) {
    alerts.send('User story quality below threshold');
  }
};
```

## Adding Custom Evaluators

Implement the `Evaluator` interface:

```typescript
import { Evaluator, EvalResult, EnhancedUserStoryOutput } from './src/evals/types';

export class MyCustomEvaluator implements Evaluator {
  name = 'MyCustomEvaluator';
  description = 'Evaluates custom quality aspects';

  async evaluate(input: string, output: EnhancedUserStoryOutput): Promise<EvalResult> {
    // Your evaluation logic here
    const score = 1.0; // 0-1 scale
    const passed = score >= 0.8;
    
    return {
      score,
      passed,
      details: 'Evaluation details',
      metadata: { /* optional metadata */ },
    };
  }
}
```

## Best Practices

1. **Regular Evaluation**: Run evaluations on representative samples regularly
2. **Trend Analysis**: Track scores over time to identify improvements or regressions
3. **Failure Analysis**: Investigate patterns in failed evaluations
4. **Custom Cases**: Add domain-specific evaluation cases for your use case
5. **Threshold Tuning**: Adjust pass thresholds based on your quality requirements

## Troubleshooting

### Common Issues

**Low Scores**: 
- Check if input user stories meet minimum quality standards
- Verify OpenAI API responses are well-formed
- Review evaluator thresholds

**Test Failures**:
- Ensure OPENAI_API_KEY is set
- Check network connectivity to OpenAI API
- Verify sufficient API quota

**Performance**:
- Use `createBasicEvalSuite()` for faster feedback
- Cache evaluation results when possible
- Run comprehensive suites less frequently