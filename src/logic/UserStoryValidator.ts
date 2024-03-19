export function validateUserStory(userStoryObjectAsString: string) {
    let userStoryObject;
  
    // Try to parse the string into a JSON object
    try {
      userStoryObject = JSON.parse(userStoryObjectAsString);
    } catch (error) {
      // If parsing fails, return false
      return false;
    }
  
    // Verify that the user story and acceptance criteria are present
    if (!userStoryObject.userStory || !userStoryObject.acceptanceCriteria) {
      return false;
    }
  
    // Verify that acceptance criteria is an array of strings
    const acceptanceCriteria = userStoryObject.acceptanceCriteria;
    if (
      !Array.isArray(acceptanceCriteria) ||
      !acceptanceCriteria.every((criteria: any) => typeof criteria === "string")
    ) {
      return false;
    }
  
    return true;
  }