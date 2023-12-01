# Enhanced User Story Function App

## Overview
This repository contains an Azure Function App that enhances user stories. Given a user story string, the function leverages LangChain and OpenAI's API to return a JSON object with an enhanced user story and an array of acceptance criteria. This could be seamlessly integrated with task management tools like Asana, providing recommendations or improvements upon the creation of a new user story.

## Features
- Enhances user stories by tapping into the power of OpenAI's API.
- Returns structured JSON response containing both the improved user story and the corresponding acceptance criteria.
- Can be easily triggered from various task management platforms upon the creation of a new user story.

## Local Development

### Prerequisites

1. **Storage Account**: The function requires a storage account. For local development, you can use Azurite, a local storage emulator.
2. **VS Code**: This readme assumes you are using VS Code for local development. Install the Azure Functions extension for a smoother experience.

### Setup & Running Locally

1. **Azurite Installation and Setup**:
    - Follow the documentation [here](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=visual-studio) to set up Azurite for local storage emulation.
    - Once set up, use the VS Code command palette to start Azurite.
2. **Running the Function**:
    - Press `F5` in the azure function file to start the function.
    - Navigate to the Azure extension, workspace, local project, functions, then EnhancedUserStory.
    - Right-click on the function and select 'execute function now' to run it.

## Updates & Enhancements

- **Refactored Input**: The hardcoded user story has been removed. The function now accepts user stories from the HTTP request.
- **OpenAI Instance Refinement**: The global llm instance is now utilized and initialized only if not already. This provides better resource management.
- **Response Handling**: Code has been updated to extract the relevant information from the OpenAI response, providing concise and meaningful output.
- **Error Handling**: Added a try-catch block to handle potential errors and to ensure that the function responds gracefully.

## Contribution & Feedback

Feel free to fork the repository, submit pull requests, or provide feedback on enhancements and improvements. Your collaboration is welcome!

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

By leveraging the power of machine learning, this function aims to improve the quality and consistency of user stories across projects. Thank you for your interest and support!
