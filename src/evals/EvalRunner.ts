import { EvalSuite, EvalReport, EnhancedUserStoryOutput } from './types';
import { enhanceUserStoryLogic } from '../logic/EnhanceUserStoryLogic';
import { OpenAI } from '@langchain/openai';

export class EvalRunner {
  private llm: OpenAI;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.llm = new OpenAI({
      openAIApiKey: apiKey,
      temperature: 0.9,
    });
  }

  async runEvalSuite(suite: EvalSuite): Promise<EvalReport> {
    const timestamp = new Date();
    const results = [];

    for (const evalCase of suite.cases) {
      try {
        // Get the enhanced user story output
        const outputString = await enhanceUserStoryLogic(
          evalCase.input,
          this.llm,
          this.apiKey
        );
        
        const output: EnhancedUserStoryOutput = JSON.parse(outputString);

        // Run all evaluators on this case
        const evaluatorResults = [];
        for (const evaluator of suite.evaluators) {
          try {
            const result = await evaluator.evaluate(evalCase.input, output);
            evaluatorResults.push({
              evaluatorName: evaluator.name,
              result,
            });
          } catch (error) {
            evaluatorResults.push({
              evaluatorName: evaluator.name,
              result: {
                score: 0,
                passed: false,
                details: `Evaluator failed: ${error.message}`,
              },
            });
          }
        }

        results.push({
          caseId: evalCase.id,
          caseName: evalCase.name,
          input: evalCase.input,
          output,
          evaluatorResults,
        });
      } catch (error) {
        // If the enhancement logic fails, record failure for all evaluators
        const evaluatorResults = suite.evaluators.map(evaluator => ({
          evaluatorName: evaluator.name,
          result: {
            score: 0,
            passed: false,
            details: `Enhancement failed: ${error.message}`,
          },
        }));

        results.push({
          caseId: evalCase.id,
          caseName: evalCase.name,
          input: evalCase.input,
          output: { userStory: '', acceptanceCriteria: [] },
          evaluatorResults,
        });
      }
    }

    // Calculate summary statistics
    const totalResults = results.reduce((acc, r) => acc + r.evaluatorResults.length, 0);
    const totalPassed = results.reduce(
      (acc, r) => acc + r.evaluatorResults.filter(er => er.result.passed).length,
      0
    );
    const totalScore = results.reduce(
      (acc, r) => acc + r.evaluatorResults.reduce((sum, er) => sum + er.result.score, 0),
      0
    );

    return {
      suiteId: suite.name,
      timestamp,
      summary: {
        totalCases: suite.cases.length,
        totalEvaluators: suite.evaluators.length,
        overallScore: totalResults > 0 ? totalScore / totalResults : 0,
        passRate: totalResults > 0 ? totalPassed / totalResults : 0,
      },
      results,
    };
  }
}