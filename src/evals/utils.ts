import { EvalReport } from './types';

/**
 * Utility functions for working with evaluation reports
 */
export class EvalReportUtils {
  /**
   * Format an evaluation report for console output
   */
  static formatReport(report: EvalReport): string {
    const lines = [];
    
    lines.push(`\n=== Evaluation Report: ${report.suiteId} ===`);
    lines.push(`Timestamp: ${report.timestamp.toISOString()}`);
    lines.push(`\nSummary:`);
    lines.push(`  Total Cases: ${report.summary.totalCases}`);
    lines.push(`  Total Evaluators: ${report.summary.totalEvaluators}`);
    lines.push(`  Overall Score: ${(report.summary.overallScore * 100).toFixed(1)}%`);
    lines.push(`  Pass Rate: ${(report.summary.passRate * 100).toFixed(1)}%`);
    
    lines.push(`\nDetailed Results:`);
    
    for (const result of report.results) {
      lines.push(`\n--- Case: ${result.caseName} ---`);
      lines.push(`Input: "${result.input.substring(0, 80)}${result.input.length > 80 ? '...' : ''}"`);
      lines.push(`Enhanced: "${result.output.userStory.substring(0, 80)}${result.output.userStory.length > 80 ? '...' : ''}"`);
      lines.push(`Acceptance Criteria: ${result.output.acceptanceCriteria.length} items`);
      
      for (const evalResult of result.evaluatorResults) {
        const { evaluatorName, result: evalData } = evalResult;
        const status = evalData.passed ? '✅' : '❌';
        const score = (evalData.score * 100).toFixed(1);
        lines.push(`  ${status} ${evaluatorName}: ${score}% - ${evalData.details}`);
      }
    }
    
    return lines.join('\n');
  }

  /**
   * Calculate average scores by evaluator across all cases
   */
  static getEvaluatorSummary(report: EvalReport): Record<string, { avgScore: number; passRate: number; totalRuns: number }> {
    const evaluatorStats: Record<string, { scores: number[]; passes: number }> = {};
    
    for (const result of report.results) {
      for (const evalResult of result.evaluatorResults) {
        const name = evalResult.evaluatorName;
        if (!evaluatorStats[name]) {
          evaluatorStats[name] = { scores: [], passes: 0 };
        }
        
        evaluatorStats[name].scores.push(evalResult.result.score);
        if (evalResult.result.passed) {
          evaluatorStats[name].passes += 1;
        }
      }
    }
    
    const summary: Record<string, { avgScore: number; passRate: number; totalRuns: number }> = {};
    
    for (const [name, stats] of Object.entries(evaluatorStats)) {
      const avgScore = stats.scores.reduce((sum, score) => sum + score, 0) / stats.scores.length;
      const passRate = stats.passes / stats.scores.length;
      
      summary[name] = {
        avgScore,
        passRate,
        totalRuns: stats.scores.length,
      };
    }
    
    return summary;
  }

  /**
   * Export report as CSV
   */
  static toCSV(report: EvalReport): string {
    const headers = ['Case ID', 'Case Name', 'Input Length', 'Output Length', 'Criteria Count', 
                    'Evaluator', 'Score', 'Passed', 'Details'];
    
    const rows = [headers.join(',')];
    
    for (const result of report.results) {
      for (const evalResult of result.evaluatorResults) {
        const row = [
          result.caseId,
          `"${result.caseName}"`,
          result.input.length,
          result.output.userStory.length,
          result.output.acceptanceCriteria.length,
          evalResult.evaluatorName,
          evalResult.result.score,
          evalResult.result.passed,
          `"${evalResult.result.details.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`, // Remove newlines
        ];
        rows.push(row.join(','));
      }
    }
    
    return rows.join('\n');
  }

  /**
   * Find cases that failed specific evaluators
   */
  static findFailures(report: EvalReport, evaluatorName?: string): Array<{
    caseId: string;
    caseName: string;
    failures: Array<{ evaluator: string; reason: string; score: number }>;
  }> {
    const failures = [];
    
    for (const result of report.results) {
      const caseFailures = result.evaluatorResults
        .filter(er => !er.result.passed && (!evaluatorName || er.evaluatorName === evaluatorName))
        .map(er => ({
          evaluator: er.evaluatorName,
          reason: er.result.details,
          score: er.result.score,
        }));
      
      if (caseFailures.length > 0) {
        failures.push({
          caseId: result.caseId,
          caseName: result.caseName,
          failures: caseFailures,
        });
      }
    }
    
    return failures;
  }
}