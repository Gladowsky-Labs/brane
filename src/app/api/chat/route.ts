import {
  validateUIMessages,
  Experimental_Agent as Agent,
  stepCountIs,
  Experimental_InferAgentUIMessage as InferAgentUIMessage,
} from 'ai';

import { auth } from '@/lib/auth';
import { createToolset, type Toolset } from '@/lib/tools';

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
  const isFirstMessage = messages.filter((m: any) => m.role === 'user').length === 1;

  console.log('=== CHAT REQUEST ===');
  console.log('isFirstMessage:', isFirstMessage);
  console.log('Total messages:', messages.length);
  console.log('User messages:', messages.filter((m: any) => m.role === 'user').length);

  // Create agent with user-specific tools
  const brane = new Agent({
    model: "moonshotai/kimi-k2-0905",
    system: `You are a helpful assistant named brane. The current date is ${localDateTime}.
             Use the provided tools to answer user queries to the best of your ability.
             If you don't know the answer, use the internet search tool to find relevant information.

             You have access to the following tools:
             - searchInternet: Search the web for information
             - storeMemory: Store new memories about the user, you can use this without the user asking you too
             - searchMemories: Search for relevant memories about the user
             - updateMemory: Update existing memories by ID
             - storeEvent: Store new events related to the user
             - searchEvents: Search for relevant events
             - updateEvent: Update existing events by ID

             At the start of each converstion, you MUST call searchMemories tool and the searchEvents tool right away before saying anything.
             You should only initialize the conversation after completeing those two tool calls. You do not reference that you made those tool calls
             in your response to the user.`,
    tools,
    stopWhen: stepCountIs(10),
  });

  return brane.respond({
    messages: await validateUIMessages({ messages }),
  });
}