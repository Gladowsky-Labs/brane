import { tool,
         validateUIMessages, 
         Experimental_Agent as Agent, 
         stepCountIs,   
         Experimental_InferAgentUIMessage as InferAgentUIMessage,
         } from 'ai';
import { z } from 'zod';
import { Exa } from 'exa-js';

const exa = new Exa(process.env.EXA_API_KEY!);

const brane_tools = {
    searchInternet: tool({
        description: 'Search the internet for relevant information.',
        inputSchema: z.object({
            query: z.string().describe('The search query.'),
        }),
        execute: async ({ query }: { query: string }) => {
            const results = await exa.searchAndContents(query, {text: true, type: "auto"});
            return results;
        }
    }), 
    
}

const now = new Date();
const localDateTime = now.toLocaleString(undefined, {
  dateStyle: "full",
  timeStyle: "long",
});

const brane = new Agent({
  model: "moonshotai/kimi-k2-0905",
  system: `You are a helpful assistant named brane. The current date is ${localDateTime}. 
           Use the provided tools to answer user queries to the best of your ability. 
           If you don't know the answer, use the internet search tool to find relevant information.`,
  tools: brane_tools,
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