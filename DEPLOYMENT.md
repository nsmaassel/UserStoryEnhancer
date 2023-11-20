# Deployment Guide

## Manual Deployment to Azure Function from Visual Studio Code

1. Install the Azure Functions extension for Visual Studio Code.
2. Open the Azure view in Visual Studio Code by clicking on the Azure icon in the Activity Bar.
3. Under the "Functions" section in the Azure view, click on the blue up arrow icon (Deploy) at the top of the section.
4. Follow the prompts in the deployment wizard to select your subscription, the function app you want to update, and the environment to which you want to deploy.
5. Wait for the deployment to complete. You can monitor the progress in the Output pane.

## Automating Deployment with CI/CD in GitHub

1. Create a `.github/workflows` directory in your repository if it doesn't already exist.
2. Create a new YAML file in the `.github/workflows` directory for your workflow (e.g., `azure_function_deploy.yml`).
3. In the YAML file, define the workflow to run whenever code is pushed to your main branch or when a pull request is made to the main branch.
4. Use the `actions/checkout@v2` action to checkout your code.
5. Use the `azure/functions-action@v1` action to deploy your function app. You'll need to provide your publish profile as a secret.
6. Save and commit your workflow file. GitHub will automatically pick up this workflow and start running it on the specified events.

Remember to replace any placeholders in the above steps with your actual data. Always store sensitive data like API keys or secrets securely.