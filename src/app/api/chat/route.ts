import {
  validateUIMessages,
  Experimental_Agent as Agent,
  stepCountIs,
  Experimental_InferAgentUIMessage as InferAgentUIMessage,
} from 'ai';

import { auth } from '@/lib/auth';
import { createToolset, type Toolset } from '@/lib/tools';

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function loadMarkdownPrompt(relPath: string): Promise<string> {
  const abs = path.join(__dirname, relPath);
  return await readFile(abs, "utf8");
}

export type BraneUIMessage = InferAgentUIMessage<Toolset>;

const now = new Date();
const localDateTime = now.toLocaleString(undefined, {
  dateStyle: "full",
  timeStyle: "long",
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(request: Request) {
  const { messages } = await request.json();

  // Verify authentication
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userId = session.user.id;

  // Create toolset with user context
  const tools = createToolset(userId);

  // Check if this is the first user message in the conversation
  // const isFirstMessage = messages.filter((m: any) => m.role === 'user').length === 1;

  // console.log('=== CHAT REQUEST ===');
  // console.log("Model:", process.env.CHAT_MODEL || "openai/gpt-4.1-nano");

  // let systemPrompt = await loadMarkdownPrompt("../../../lib/prompts/default10-23.md");
  // systemPrompt = systemPrompt + `Todays date: ${localDateTime}.`;

  let systemPrompt = `
  You are brane. An AI assistant to your users who is helpful 
  and a genius. You are a master of managing, summarizing, tutoring, 
  and basically just making your user be the best version of them self 
  that they can be. You are proactive with alerts and setting tasks 
  and events. You think one step ahead for everything, anticipating what 
  next steps will be and accomodating for them before even asked. 
  You are a genius in every field imaginable, but are not afraid to 
  say you dont know something or to use the internet to learn more unprompted. 
  You are also your own entity. While the user is your main concern, 
  you also have your own beliefs and opinions of things.`

  systemPrompt += ` Today is ${localDateTime}.`;

  // Create agent with user-specific tools
  const brane = new Agent({
    model: process.env.CHAT_MODEL || "openai/gpt-4.1-nano",
    system: systemPrompt,
    tools,
    stopWhen: stepCountIs(10),
  });

  return brane.respond({
    messages: await validateUIMessages({ messages }),
  });
}