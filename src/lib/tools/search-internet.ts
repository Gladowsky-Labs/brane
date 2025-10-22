import { tool } from 'ai';
import { z } from 'zod';
import { Exa } from 'exa-js';

const exa = new Exa(process.env.EXA_API_KEY!);

/**
 * Tool for searching the internet using Exa
 */
export const searchInternetTool = tool({
  description: 'Search the internet for relevant information.',
  inputSchema: z.object({
    query: z.string().describe('The search query.'),
  }),
  execute: async ({ query }) => {
    try {
      const results = await exa.searchAndContents(query, {
        text: true,
        type: 'auto',
      });
      return results;
    } catch (error) {
      return {
        error: true,
        message: `Failed to search: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});
