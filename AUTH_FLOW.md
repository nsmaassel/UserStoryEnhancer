# Azure Function Authentication with Client Credentials Flow

This document outlines the steps to secure an Azure Function using the OAuth 2.0 Client Credentials flow, setup in Azure, and how to test it using Postman.

## Securing Azure Function

- **App Registration**: Create an App Registration in Azure AD for the Azure Function.
- **Certificates & Secrets**: Generate a new client secret in the "Certificates & Secrets" section.
- **Expose an API**: Define the scope under "Expose an API" in the App Registration.

## Configuring Azure Function

- Set the **Authentication / Authorization** settings in the Function App to require Azure AD authentication.
- Link the App Registration to the Function App Authentication settings.

## Testing with Postman

- Obtain an Access Token:
  - Use the OAuth 2.0 token endpoint in Azure AD.
  - Configure the request with "Client Credentials" grant type.
  - Include the Client ID and Client Secret from the App Registration.
  - Set the scope to `api://<Function App Client ID>/.default`.

- Make the Request:
  - Set the HTTP method to POST.
  - Include the `Authorization: Bearer <Access Token>` header.
  - Set the request body as required by the Azure Function.

## Local Development

- Ensure that local settings for running the Function App include the necessary Azure AD details (client ID, tenant ID, and client secret).
- Use environment variables to switch between live and mock services.

For a detailed guide, refer to the official [Microsoft documentation on securing Azure Functions](https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-http-webhook-trigger?tabs=python-v2%2Cisolated-process%2Cnodejs-v4%2Cfunctionsv2&pivots=programming-language-typescript).

