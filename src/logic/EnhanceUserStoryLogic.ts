import { z } from "zod";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";

// Minimum length for the input user story
const minUserStoryLength = 50;

export const enhanceUserStoryLogic = async (
  inputtedUserStory: string,
  llm: OpenAI,
  openAIApiKey: string
) => {
  if (inputtedUserStory.length < minUserStoryLength) {
    throw new Error(
      `The user story is too short. Please provide at least ${minUserStoryLength} characters.`
    );
  }

  if (!llm) {
    llm = new OpenAI({
      openAIApiKey: openAIApiKey,
      temperature: 0.9,
    });
  }

  // Define schema using Zod
  const parser = StructuredOutputParser.fromZodSchema(
    z.object({
      userStory: z.string().describe("the enhanced user story"),
      acceptanceCriteria: z
        .array(z.string())
        .describe(
          "specific acceptance criteria for developers to test against"
        ),
    })
  );

  const formatInstructions = parser.getFormatInstructions();

  const prompt = new PromptTemplate({
    template:
      "Given the following user stories, enhance them and provide specific acceptance criteria that developers can write tests for. Please limit the enhanced user story to one requirement.\n\n" +
      "Example 1:\n" +
      "Input: 'As a user, I want to be able to register an account so that I can access the platform.'\n" +
      "Output: 'As a new user, I want to be able to register an account with my email and a password so that I can create a personal profile and access the platform.'\n\n" +
      "Example 2:\n" +
      "Input: 'As an admin, I want to view user statistics so that I can understand user behavior.'\n" +
      "Output: 'As an admin, I want to view detailed user statistics including active users, most used features, and user growth so that I can understand user behavior and make informed decisions.'\n\n" +
      "Now, enhance this user story:\n" +
      "'{inputtedUserStory}'",
    inputVariables: ["inputtedUserStory"],
    partialVariables: { format_instructions: formatInstructions },
  });

  const input = await prompt.format({ inputtedUserStory: inputtedUserStory });

  let openAIResponse;
  let structuredResponse;
  let attempt = 0;
  const maxAttempts = 5;

  while (attempt < maxAttempts) {
    try {
      console.group("Calling OpenAI with prompt");
      console.debug("Prompt:", input);
      openAIResponse = await llm.call(input);
      console.debug("Response:", openAIResponse);
      console.groupEnd();

      structuredResponse = await parser.parse(openAIResponse);

      // If parsing was successful, return the result
      return structuredResponse;
    } catch (error) {
      console.error(`Error on attempt ${attempt + 1}`, error);
      attempt++;
    }
  }

  throw new Error(
    "After 5 attempts, the response from OpenAI did not match the expected format."
  );
};
