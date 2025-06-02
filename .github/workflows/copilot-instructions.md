# Copilot Instructions for UserStoryEnhancer Azure Function

## Project Overview
This is a TypeScript-based Azure Functions v4 project that enhances user stories using LangChain and OpenAI. The function accepts a user story via HTTP POST and returns an enhanced version with acceptance criteria.

## Technology Stack
- **Runtime**: Node.js 18.x
- **Azure Functions Runtime**: v4 (latest)
- **Language**: TypeScript 5.3.3
- **Key Dependencies**:
  - `@azure/functions`: ^4.0.0-alpha.7
  - `@langchain/core`: ~0.1.45 (pinned version)
  - `@langchain/openai`: ^0.0.21
  - `langchain`: ^0.1.28
  - `dotenv`: ^16.3.1
- **Testing Framework**: Jest 29.x with ts-jest

## Project Structure
```
src/
├── functions/           # Azure Function entry points
│   └── EnhanceUserStory.ts
└── logic/              # Business logic (testable, separated from Azure specifics)
    ├── EnhanceUserStoryLogic.ts
    ├── EnhanceUserStoryLogic.test.ts
    ├── UserStoryValidator.ts
    └── UserStoryValidator.test.ts
```

## Best Practices to Follow

### 1. Function Development
- Use the new programming model with `@azure/functions` v4
- Keep function handlers thin - delegate to logic layer
- Use proper TypeScript types from `@azure/functions`
- Return `HttpResponseInit` objects with proper status codes and headers

### 2. Error Handling
- Always wrap async operations in try-catch blocks
- Return appropriate HTTP status codes:
  - 400: Bad Request (validation errors)
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Not Found
  - 500: Internal Server Error
- Include error details in JSON response body

### 3. Environment Variables
- Use `dotenv` for local development
- Required variables:
  - `OPENAI_API_KEY`: OpenAI API key
- Access via `process.env.VARIABLE_NAME`

### 4. Testing
- Write unit tests for all logic functions
- Use `jest-mock-extended` for mocking dependencies
- Test file naming: `*.test.ts`
- Run tests with: `npm test`

### 5. Local Development
- Use Azurite for local storage emulation
- Press F5 in VS Code to debug
- Function runs on `http://localhost:7071/api/EnhanceUserStory`

### 6. Code Organization
- Separate business logic from Azure Function specifics
- Use dependency injection for testability
- Export logic functions for reuse and testing

### 7. LangChain Integration
- Use structured output parsing with Zod schemas
- Handle OpenAI API responses with retry logic (max 5 attempts)
- Validate responses before returning

### 8. Build and Deployment
- Build: `npm run build` (compiles TypeScript to `dist/`)
- Clean: `npm run clean` (removes dist folder)
- Deploy via GitHub Actions or VS Code Azure Functions extension

## Example Code Patterns

### Function Handler Pattern
```typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function FunctionName(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    // Handle request
    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result)
    };
  } catch (error) {
    context.log(`Error: ${error.message}`);
    return {
      status: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}

app.http("FunctionName", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: FunctionName,
});
```

### Logic Function Pattern
```typescript
export const businessLogic = async (
  input: string,
  dependencies: any,
  validator: (input: string) => boolean = defaultValidator
): Promise<Result> => {
  // Validate input
  if (!validator(input)) {
    throw new Error("Invalid input");
  }
  
  // Process with retry logic
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      const result = await dependencies.process(input);
      if (validator(result)) {
        return result;
      }
    } catch (error) {
      attempts++;
    }
  }
  
  throw new Error("Failed after maximum attempts");
};
```

## Common Issues and Solutions

1. **LangChain Version Conflicts**: The project pins `@langchain/core` to version ~0.1.45 using resolutions/overrides
2. **TypeScript Compilation**: Ensure `tsconfig.json` targets ES6 with CommonJS modules
3. **Azure Functions v4**: Use the new programming model with `app.http()` instead of legacy exports

## CI/CD Notes
- GitHub Actions workflow deploys to Azure on push to main branch
- Workflow uses federated credentials (no secrets in code)
- Tests run automatically before deployment