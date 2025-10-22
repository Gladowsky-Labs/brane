import { tool } from 'ai';
import { z } from 'zod';
import { insertMemory } from './helpers';

/**
 * Create a tool for storing new memories
 */
export function createStoreMemoryTool(userId: string) {
  return tool({
    description: 'Store a new memory about the user for future reference. Use this to remember important facts, preferences, or context about the user.',
    inputSchema: z.object({
      text: z.string().describe('The memory content to store'),
    }),
    execute: async ({ text }) => {
      try {
        const memoryId = await insertMemory(userId, text);
        return {
          success: true,
          message: `Memory stored successfully with ID ${memoryId}`,
          memoryId,
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to store memory: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    },
  });
}
