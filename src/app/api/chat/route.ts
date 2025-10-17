// src/app/api/chat/route.ts
import { openai } from "@ai-sdk/openai";
import { streamText, UIMessage, convertToModelMessages, stepCountIs } from "ai";
import { tools } from "@/lib/tools";
import { buildContextPrompt, buildSystemPrompt } from "@/lib/context";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const context = await buildContextPrompt();

  const result = streamText({
    model: openai("gpt-5-nano-2025-08-07"),
    messages: convertToModelMessages(messages),
    system: buildSystemPrompt(context),
    stopWhen: stepCountIs(5),
    tools,
  });

  return result.toUIMessageStreamResponse();
}
