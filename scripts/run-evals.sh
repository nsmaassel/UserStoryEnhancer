#!/bin/bash

# User Story Enhancement Quality Evaluator
# This script runs quality evaluations on the user story enhancement system

set -e

echo "🔍 User Story Enhancement Quality Evaluator"
echo "=========================================="

# Check if OpenAI API key is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Error: OPENAI_API_KEY environment variable is not set"
    echo "Please set your OpenAI API key:"
    echo "  export OPENAI_API_KEY=your_api_key_here"
    exit 1
fi

# Check if Node.js and npm are available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Run different evaluation modes based on argument
case "${1:-standard}" in
    "basic")
        echo "🚀 Running basic evaluation suite..."
        echo "This is faster and focuses on format compliance and structure."
        npm run eval:basic
        ;;
    "standard"|"")
        echo "🚀 Running standard evaluation suite..."
        echo "This provides comprehensive quality assessment."
        npm run eval
        ;;
    "test")
        echo "🧪 Running evaluation framework tests..."
        npm test -- --testPathPattern="evals"
        ;;
    "help"|"-h"|"--help")
        echo ""
        echo "Usage: $0 [mode]"
        echo ""
        echo "Modes:"
        echo "  basic     - Run basic evaluation suite (fast)"
        echo "  standard  - Run comprehensive evaluation suite (default)"
        echo "  test      - Run evaluation framework tests"
        echo "  help      - Show this help message"
        echo ""
        echo "Example:"
        echo "  export OPENAI_API_KEY=your_key_here"
        echo "  $0 basic"
        ;;
    *)
        echo "❌ Error: Unknown mode '$1'"
        echo "Run '$0 help' for usage information"
        exit 1
        ;;
esac

echo ""
echo "✅ Evaluation complete!"