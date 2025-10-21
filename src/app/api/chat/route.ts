import { streamText, 
         UIMessage, 
         convertToModelMessages, 
         validateUIMessages, 
         Experimental_Agent as Agent, 
         stepCountIs,   
         Experimental_InferAgentUIMessage as InferAgentUIMessage,
         } from 'ai';

const brane = new Agent({
  model: "moonshotai/kimi-k2-0905",
  system: "You are a helpful assistant named brane.",
  stopWhen: stepCountIs(5),
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(request: Request) {
  const { messages } = await request.json();

  return brane.respond({
    messages: await validateUIMessages({ messages }),
  });
}

export type BraneUIMessage = InferAgentUIMessage<typeof brane>;