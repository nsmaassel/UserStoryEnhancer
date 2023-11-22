import { z } from "zod";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";

// Minimum length for the input user story
const minUserStoryLength = 50;

// Define the schema for the user story we'll return
// const userStorySchema = z
//   .object({
//     persona: z.string(),
//     requirement: z.string(),
//     businessValue: z.string(),
//   })
//   .refine(
//     (data) =>
//       `As a ${data.persona}, I want ${data.requirement}, so that ${data.businessValue}`.match(
//         /As a .+, I want .+, so that .+/
//       ),
//     {
//       message:
//         "User story must be in the format: 'As a <persona>, I want <requirement>, so that <businessValue>'",
//     }
//   );
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

  // Instructr the LLM on what kind of output we'd like using our schema
  const parser = StructuredOutputParser.fromZodSchema(enhancedUserStorySchema);
  const formatInstructions = parser.getFormatInstructions();
  const prompt = new PromptTemplate({
    template:
      "Given the user story '{inputtedUserStory}', enhance it and provide specific acceptance criteria that developers can write tests for. Please limit the enhanced user story to one requirement.\n{format_instructions}\n{inputtedUserStory}",
    inputVariables: ["inputtedUserStory"],
    partialVariables: { format_instructions: formatInstructions },
  });

  const input = await prompt.format({ inputtedUserStory: inputtedUserStory });

  let openAIResponse;
  let structuredResponse;
  let attempt = 0;
  const maxAttempts = 5;
  const responses = [];

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
      responses.push(openAIResponse);
      attempt++;
    }
  }

  console.error("OpenAI responses:", responses);

  throw new Error(
    `After ${maxAttempts} attempts, the response from OpenAI did not match the expected format.`
  );
};
