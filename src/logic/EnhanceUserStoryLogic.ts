import { z } from "zod";
import { OpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";
import { validateUserStory } from "./UserStoryValidator";

// Minimum length for the input user story
const minUserStoryLength = 50;

// Define the schema for the user story
const userStorySchema = z.string();

// The acceptance criteria will just be a list of strings
const acceptanceCriteriaSchema = z.array(z.string());

// Combine the two schemas into one
const enhancedUserStorySchema = z.object({
  userStory: userStorySchema,
  acceptanceCriteria: acceptanceCriteriaSchema,
});

export const enhanceUserStoryLogic = async (
  inputtedUserStory: string,
  llm: OpenAI,
  openAIApiKey: string,
  isValidUserStory: (input: string) => boolean = validateUserStory
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

  // Instruct the LLM on what kind of output we'd like using our schema
  const parser = StructuredOutputParser.fromZodSchema(enhancedUserStorySchema);
  const formatInstructions = parser.getFormatInstructions();
  const prompt = new PromptTemplate({
    template:
      "Given the user story '{inputtedUserStory}', enhance it to clearly describe a feature from the perspective of a user, including specific actions, roles, or outcomes. The enhanced user story should be limited to one requirement. Provide specific acceptance criteria that developers can write tests for. The acceptance criteria should be a list of SMART (Specific, Measurable, Achievable, Relevant, Time-bound) statements. Please limit the enhanced user story to one requirement.\n{format_instructions}\n{inputtedUserStory}",
    inputVariables: ["inputtedUserStory"],
    partialVariables: { format_instructions: formatInstructions },
  });

  const input = await prompt.format({ inputtedUserStory: inputtedUserStory });

  let openAIResponse;
  let attempt = 0;
  const maxAttempts = 5;
  const responses = [];

  while (attempt < maxAttempts) {
    try {
      const response = await llm.invoke(input);

      // Use the passed-in function to validate the response
      if (isValidUserStory(response)) {
        // If the response is valid, return it
        return response;
      } else {
        // If the response is not valid, throw an error
        throw new Error("Invalid response");
      }
    } catch (error) {
      responses.push(openAIResponse);
      attempt++;
    }
  }

  throw new Error(
    `After ${maxAttempts} attempts, the response from OpenAI did not match the expected format. OpenAI responses: ${responses.map(
      (response, index) => `\nResponse ${index + 1}: ${response}`
    )}`
  );
};
