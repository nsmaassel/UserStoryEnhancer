Trying to run locally.  Needs storage account.

Docs say to use Azurite for local storage dev emulation:
https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=visual-studio

Was able to use the VS Code command palette to start Azurite then F5 in the azure function file to start the function.  Then going to the Azure extension, workspace, local project, functions, EnhancedUserStory and right-clicking on the fucntion to 'execute function now' worked.

First round of ChatGPT enhancements:
Removed the hardcoded user story and replaced it with the user story from the HTTP request.
Cleaned up the OpenAI instance creation. The global llm instance is used and initialized if not already.
Updated the code to extract the relevant information from the OpenAI response.
Added a try-catch block for error handling.
Returned a structured JSON response.

