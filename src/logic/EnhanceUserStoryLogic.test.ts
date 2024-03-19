import { OpenAI } from "@langchain/openai";
import { mock } from "jest-mock-extended";
import { enhanceUserStoryLogic } from "./EnhanceUserStoryLogic";

describe("enhanceUserStoryLogic", () => {
  const inputtedUserStory =
    "As a user, I want to be able to log in to my account so that I can access my dashboard.";
  const openAIApiKey = "my-openai-api-key";

  // Create a mock instance
  const llmMock = mock<OpenAI>();

  // Define a mock parser function that always returns true
  const mockParserTrue = () => true;

  // Define a mock parser function that always returns false
  const mockParserFalse = () => false;

  // Define a mock response
  const mockOpenAIResponse = {
    userStory: "Mocked enhanced user story.",
    acceptanceCriteria: ["Mocked acceptance criteria."],
  };

  // Create a spy on the invoke method and mock its implementation
  const invokeSpy = jest
    .spyOn(llmMock, "invoke")
    .mockResolvedValue(JSON.stringify(mockOpenAIResponse));

  beforeEach(() => {
    // Clear mock call history before each test
    jest.clearAllMocks();
  });
  it("should throw an error if the inputted user story is too short", async () => {
    const shortUserStory = "As a user, I want to log in.";

    await expect(
      enhanceUserStoryLogic(shortUserStory, llmMock, openAIApiKey)
    ).rejects.toThrow(
      `The user story is too short. Please provide at least 50 characters.`
    );
  });

  it("should return an object with enhanced user story and acceptance criteria", async () => {
    const resultString = await enhanceUserStoryLogic(
      inputtedUserStory,
      llmMock,
      openAIApiKey,
      mockParserTrue // pass the mock parser function here
    );

    const result = JSON.parse(resultString);

    expect(result).toHaveProperty("userStory");
    expect(result).toHaveProperty("acceptanceCriteria");
    expect(result.userStory).not.toBe(inputtedUserStory);
    expect(result.acceptanceCriteria.length).toBeGreaterThan(0);

    expect(invokeSpy).toHaveBeenCalledTimes(1);
  });

  it("should throw an error if the response from OpenAI does not match the expected format", async () => {
    // Change the implementation of the spy for this test case
    invokeSpy.mockResolvedValue("invalid-response");

    const invalidApiKey = "invalid-api-key";
    await expect(
      enhanceUserStoryLogic(
        inputtedUserStory,
        null,
        invalidApiKey,
        mockParserFalse
      )
    ).rejects.toThrow(
      `After 5 attempts, the response from OpenAI did not match the expected format.`
    );
  }, 50000);
});
