import { EvalSuite } from '../types';
import { sampleEvalCases } from '../fixtures/sampleCases';
import {
  FormatComplianceEvaluator,
  UserStoryStructureEvaluator,
  AcceptanceCriteriaQualityEvaluator,
  SingleRequirementEvaluator,
} from '../evaluators';

export function createStandardEvalSuite(): EvalSuite {
  return {
    name: 'standard-quality-suite',
    description: 'Comprehensive evaluation suite for user story enhancement quality',
    cases: sampleEvalCases,
    evaluators: [
      new FormatComplianceEvaluator(),
      new UserStoryStructureEvaluator(),
      new AcceptanceCriteriaQualityEvaluator(),
      new SingleRequirementEvaluator(),
    ],
  };
}

export function createBasicEvalSuite(): EvalSuite {
  return {
    name: 'basic-compliance-suite',
    description: 'Basic evaluation suite focusing on format and structure compliance',
    cases: sampleEvalCases.slice(0, 3), // Use first 3 cases for faster testing
    evaluators: [
      new FormatComplianceEvaluator(),
      new UserStoryStructureEvaluator(),
    ],
  };
}

export function createQualityFocusedSuite(): EvalSuite {
  return {
    name: 'quality-focused-suite',
    description: 'Evaluation suite focused on content quality and business requirements',
    cases: sampleEvalCases,
    evaluators: [
      new AcceptanceCriteriaQualityEvaluator(),
      new SingleRequirementEvaluator(),
    ],
  };
}