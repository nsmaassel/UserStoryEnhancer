// Core types for the evaluation framework

export interface EvalResult {
  score: number; // 0-1 where 1 is best
  passed: boolean;
  details: string;
  metadata?: Record<string, any>;
}

export interface EvalCase {
  id: string;
  name: string;
  input: string;
  expectedOutput?: {
    userStory?: string;
    acceptanceCriteria?: string[];
  };
  tags?: string[];
}

export interface EnhancedUserStoryOutput {
  userStory: string;
  acceptanceCriteria: string[];
}

export interface Evaluator {
  name: string;
  description: string;
  evaluate(input: string, output: EnhancedUserStoryOutput): Promise<EvalResult>;
}

export interface EvalSuite {
  name: string;
  description: string;
  cases: EvalCase[];
  evaluators: Evaluator[];
}

export interface EvalReport {
  suiteId: string;
  timestamp: Date;
  summary: {
    totalCases: number;
    totalEvaluators: number;
    overallScore: number;
    passRate: number;
  };
  results: Array<{
    caseId: string;
    caseName: string;
    input: string;
    output: EnhancedUserStoryOutput;
    evaluatorResults: Array<{
      evaluatorName: string;
      result: EvalResult;
    }>;
  }>;
}