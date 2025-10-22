import { tool } from 'ai';
import { z } from 'zod';
import { searchMemoriesByVector } from './helpers';

/**
 * Create a tool for searching memories
 */
export function createSearchMemoriesTool(userId: string) {
  return tool({
    description: 'Search for relevant memories about the user using semantic search. Returns memories ranked by relevance to the query.',
    inputSchema: z.object({
      query: z
        .string()
        .describe('The search query to find relevant memories'),
      limit: z
        .number()
        .min(1)
        .max(20)
        .optional()
        .describe('Maximum number of memories to return (default: 5)'),
    }),
    execute: async ({ query, limit = 5 }) => {
      try {
        const memories = await searchMemoriesByVector(
          query,
          userId,
          limit
        );

        if (memories.length === 0) {
          return {
            success: true,
            message: 'No relevant memories found',
            memories: [],
          };
        }

        // Format memories for display
        const formatted = memories.map((m) => ({
          id: m.id,
          text: m.text,
          similarity: Math.round(m.similarity * 100),
          createdAt: m.createdAt.toISOString(),
        }));

        return {
          success: true,
          message: `Found ${memories.length} relevant ${memories.length === 1 ? 'memory' : 'memories'}`,
          memories: formatted,
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to search memories: ${error instanceof Error ? error.message : 'Unknown error'}`,
          memories: [],
        };
      }
    },
  });
}
