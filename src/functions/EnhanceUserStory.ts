import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { OpenAI } from "langchain/llms/openai";
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
      // 200 is used for successful requests
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(structuredResponse),
    };
  } catch (error) {
    context.log(`Error: ${error.message}`);

    if (error.message.includes("too short")) {
      // 400 is used for bad requests from the client
      return { status: 400, body: JSON.stringify({ error: error.message }) };
    } else {
      // 500 is used for internal server errors
      return { status: 500, body: JSON.stringify({ error: error.message }) };
    }
  }
}

app.http("EnhanceUserStory", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: EnhanceUserStory,
});
