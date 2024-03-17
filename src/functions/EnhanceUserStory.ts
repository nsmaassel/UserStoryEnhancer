import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { OpenAI } from "@langchain/openai";
import { enhanceUserStoryLogic } from "../logic/EnhanceUserStoryLogic";

// Setup dotenv
import "dotenv/config";

const llm = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0.9,
});

export async function EnhanceUserStory(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  const inputtedUserStory = await request.text();

  try {
    const structuredResponse = await enhanceUserStoryLogic(
      inputtedUserStory,
      llm,
      process.env.OPENAI_API_KEY
    );

    return {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(structuredResponse),
    };
  } catch (error) {
    context.log(`Error: ${error.message}`);

    if (error.message.includes("too short")) {
      return { status: 400, body: JSON.stringify({ error: error.message }) };
    } else if (error.message.includes("unauthorized")) {
      return { status: 401, body: JSON.stringify({ error: error.message }) };
    } else if (error.message.includes("forbidden")) {
      return { status: 403, body: JSON.stringify({ error: error.message }) };
    } else if (error.message.includes("not found")) {
      return { status: 404, body: JSON.stringify({ error: error.message }) };
    } else {
      return { status: 500, body: JSON.stringify({ error: error.message }) };
    }
  }
}

app.http("EnhanceUserStory", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: EnhanceUserStory,
});
