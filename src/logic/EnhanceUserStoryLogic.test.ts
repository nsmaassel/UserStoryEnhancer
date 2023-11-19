import { enhanceUserStoryLogic } from "./EnhanceUserStoryLogic";
import { OpenAI } from "langchain/llms/openai";
import { mock } from "jest-mock-extended";

describe("enhanceUserStoryLogic", () => {
  const inputtedUserStory =
    "As a user, I want to be able to log in to my account so that I can access my dashboard.";
  const openAIApiKey = "my-openai-api-key";

  // Create a mock instance
  const llmMock = mock<OpenAI>();

  // Define a mock response
  const mockOpenAIResponse = JSON.stringify({
    id: "mocked-id",
    object: "text.completion",
    created: Date.now(),
    model: "mocked-model",
    usage: {
      prompt_tokens: 10,
      completion_tokens: 20,
      total_tokens: 30,
    },
    choices: [
      {
        message: {
          role: "assistant",
          content:
            "Mocked enhanced user story. Provide specific acceptance criteria here.",
        },
        finish_reason: "stop",
        index: 0,
      },
    ],
  });

  beforeEach(() => {
    llmMock.call.mockClear(); // Clear mock call history before each test
  });

  it("should throw an error if the inputted user story is too short", async () => {
    const shortUserStory = "As a user, I want to log in.";
    try {
      await enhanceUserStoryLogic(shortUserStory, llmMock, openAIApiKey);
    } catch (error) {
      expect(error).toEqual(
        new Error(
          `The user story is too short. Please provide at least 50 characters.`
        )
      );
      expect(error.message).toEqual(
        `The user story is too short. Please provide at least 50 characters.`
      );
    }
  });

  it("should return an object with enhanced user story and acceptance criteria", async () => {
    llmMock.call.mockResolvedValue(mockOpenAIResponse);
    const result = await enhanceUserStoryLogic(
      inputtedUserStory,
      llmMock,
      openAIApiKey
    );
    expect(result).toHaveProperty("userStory");
    expect(result).toHaveProperty("acceptanceCriteria");
    expect(result.userStory).not.toBe(inputtedUserStory);
    expect(result.userStory.length).toBeGreaterThan(inputtedUserStory.length);
    expect(result.acceptanceCriteria.length).toBeGreaterThan(0);

    expect(llmMock.call).toHaveBeenCalledTimes(1);
  });

  it("should throw an error if the response from OpenAI does not match the expected format", async () => {
    llmMock.call.mockResolvedValue("invalid-response");
    const invalidApiKey = "invalid-api-key";
    await expect(
      enhanceUserStoryLogic(inputtedUserStory, null, invalidApiKey)
    ).rejects.toThrow(
      `After 5 attempts, the response from OpenAI did not match the expected format.`
    );
  });
});
