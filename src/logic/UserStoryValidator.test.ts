import { validateUserStory } from "./UserStoryValidator";

describe("validateUserStory", () => {
  const userStoryObject = {
    userStory:
      "As a user, I want to be able to log in to my account so that I can access my dashboard.",
    acceptanceCriteria: [
      "The user should be able to log in with their email and password.",
      "The user should be able to log in with their Google account.",
    ],
  };

  const userStoryObjectString = JSON.stringify(userStoryObject);

  it("should return true if the user story is valid", () => {
    const result = validateUserStory(userStoryObjectString);
    expect(result).toBe(true);
  });

  it("should return false if the user story is mising a required field", () => {
    // Create a copy of the user story object
    const userStoryObjectWithoutUserStory = { ...userStoryObject };

    // Omit the userStory field
    delete userStoryObjectWithoutUserStory.userStory;

    // Convert the object to a string
    const userStoryObjectStringWithoutUserStory = JSON.stringify(
      userStoryObjectWithoutUserStory
    );

    // Omit the acceptanceCriteria field
    const result = validateUserStory(userStoryObjectStringWithoutUserStory);
    expect(result).toBe(false);
  });
});
