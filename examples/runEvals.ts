#!/usr/bin/env ts-node

/**
 * Example script demonstrating how to use the evaluation framework
 * 
 * Usage:
 *   npx ts-node examples/runEvals.ts
 * 
 * Make sure to set OPENAI_API_KEY environment variable
 */

import * as dotenv from 'dotenv';
import { EvalRunner, createStandardEvalSuite, createBasicEvalSuite, EvalReportUtils } from '../src/evals';

// Load environment variables
dotenv.config();

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }

  console.log('🚀 Starting User Story Enhancement Evaluation...\n');

  try {
    const runner = new EvalRunner(apiKey);

    // Run the basic evaluation suite first (faster)
    console.log('📋 Running Basic Evaluation Suite...');
    const basicSuite = createBasicEvalSuite();
    const basicReport = await runner.runEvalSuite(basicSuite);
    
    console.log('\n📊 Basic Suite Results:');
    console.log(EvalReportUtils.formatReport(basicReport));

    // Run the comprehensive evaluation suite
    console.log('\n📋 Running Comprehensive Evaluation Suite...');
    const standardSuite = createStandardEvalSuite();
    const standardReport = await runner.runEvalSuite(standardSuite);
    
    console.log('\n📊 Comprehensive Suite Results:');
    console.log(EvalReportUtils.formatReport(standardReport));

    // Show evaluator performance summary
    console.log('\n📈 Evaluator Performance Summary:');
    const evaluatorSummary = EvalReportUtils.getEvaluatorSummary(standardReport);
    
    for (const [name, stats] of Object.entries(evaluatorSummary)) {
      console.log(`  ${name}:`);
      console.log(`    Average Score: ${(stats.avgScore * 100).toFixed(1)}%`);
      console.log(`    Pass Rate: ${(stats.passRate * 100).toFixed(1)}%`);
      console.log(`    Total Evaluations: ${stats.totalRuns}`);
    }

    // Show failures for analysis
    console.log('\n🔍 Analysis of Failures:');
    const failures = EvalReportUtils.findFailures(standardReport);
    
    if (failures.length === 0) {
      console.log('🎉 No failures detected! All user stories passed evaluation.');
    } else {
      for (const failure of failures) {
        console.log(`\n❌ Case: ${failure.caseName}`);
        for (const f of failure.failures) {
          console.log(`   ${f.evaluator} (Score: ${(f.score * 100).toFixed(1)}%): ${f.reason}`);
        }
      }
    }

    // Export detailed results
    console.log('\n💾 Exporting detailed results...');
    const csvData = EvalReportUtils.toCSV(standardReport);
    const fs = require('fs');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `eval-report-${timestamp}.csv`;
    
    fs.writeFileSync(filename, csvData);
    console.log(`📄 Detailed results exported to: ${filename}`);

    // Overall assessment
    const overallScore = standardReport.summary.overallScore;
    const passRate = standardReport.summary.passRate;
    
    console.log('\n🎯 Overall Assessment:');
    if (overallScore >= 0.8 && passRate >= 0.8) {
      console.log('✅ EXCELLENT: User story enhancement is performing very well!');
    } else if (overallScore >= 0.6 && passRate >= 0.6) {
      console.log('⚠️  GOOD: User story enhancement is working well with some areas for improvement.');
    } else {
      console.log('❌ NEEDS IMPROVEMENT: User story enhancement needs significant improvements.');
    }

    console.log(`Final Score: ${(overallScore * 100).toFixed(1)}% | Pass Rate: ${(passRate * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Error running evaluations:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}