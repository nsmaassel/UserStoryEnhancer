# Enhanced User Story Function App

## Overview
This repository contains an Azure Function App that enhances user stories. Given a user story string, the function leverages LangChain and OpenAI's API to return a JSON object with an enhanced user story and an array of acceptance criteria. This could be seamlessly integrated with task management tools like Jira, Asana, Trello, etc. providing recommendations or improvements upon the creation of a new user story.

## Features
- Enhances user stories by tapping into the power of OpenAI's API.
- Returns structured JSON response containing both the improved user story and the corresponding acceptance criteria.
- Can be easily triggered from various task management platforms upon the creation of a new user story.
- **Comprehensive evaluation framework** for measuring and monitoring enhancement quality.
- **Built-in quality assessments** including format compliance, structure validation, and SMART criteria analysis.

## Local Development

### Prerequisites

1. **Storage Account**: The function requires a storage account. For local development, you can use Azurite, a local storage emulator.
2. **VS Code**: This readme assumes you are using VS Code for local development. Install the Azure Functions extension for a smoother experience.
3. **OpenAI API Key**: Required for both the enhancement functionality and evaluation framework.

### Setup & Running Locally

1. **Azurite Installation and Setup**:
    - Follow the documentation [here](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=visual-studio) to set up Azurite for local storage emulation.
    - Once set up, use the VS Code command palette to start Azurite.
2. **Environment Setup**:
    - Copy your OpenAI API key to a `.env` file: `OPENAI_API_KEY=your_key_here`
3. **Running the Function**:
    - Press `F5` in the azure function file to start the function.
    - Navigate to the Azure extension, workspace, local project, functions, then EnhancedUserStory.
    - Right-click on the function and select 'execute function now' to run it.

### Quality Evaluation

This project includes a comprehensive evaluation framework to measure the quality of user story enhancements:

```bash
# Run quality evaluations
export OPENAI_API_KEY=your_api_key_here
npx ts-node examples/runEvals.ts
```

See [docs/EVALUATIONS.md](docs/EVALUATIONS.md) for detailed documentation on the evaluation framework.

## Updates & Enhancements

- **Refactored Input**: The hardcoded user story has been removed. The function now accepts user stories from the HTTP request.
- **OpenAI Instance Refinement**: The global llm instance is now utilized and initialized only if not already. This provides better resource management.
- **Response Handling**: Code has been updated to extract the relevant information from the OpenAI response, providing concise and meaningful output.
- **Error Handling**: Added a try-catch block to handle potential errors and to ensure that the function responds gracefully.
- **🆕 Evaluation Framework**: Added comprehensive quality measurement system with multiple evaluators:
  - **Format Compliance**: Validates JSON structure and required fields
  - **User Story Structure**: Ensures proper "As a... I want... So that..." format
  - **Acceptance Criteria Quality**: Assesses SMART criteria and testability
  - **Single Requirement Focus**: Validates adherence to single requirement principle
- **🆕 Quality Monitoring**: Built-in tools for tracking enhancement quality over time and identifying areas for improvement.

## Contribution & Feedback

Feel free to fork the repository, submit pull requests, or provide feedback on enhancements and improvements. Your collaboration is welcome!

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

By leveraging the power of machine learning, this function aims to improve the quality and consistency of user stories across projects. Thank you for your interest and support!
