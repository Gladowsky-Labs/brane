import { tool } from 'ai';
import { z } from 'zod';
import { updateMemory } from './helpers';

/**
 * Create a tool for updating existing memories
 */
export function createUpdateMemoryTool(userId: string) {
  return tool({
    description: 'Update an existing memory by ID. Updates the text content of the memory.',
    inputSchema: z.object({
      id: z
        .number()
        .int()
        .positive()
        .describe('The ID of the memory to update'),
      text: z
        .string()
        .describe('New text content for the memory'),
    }),
    execute: async ({ id, text }) => {
      try {
        const success = await updateMemory(id, userId, text);

        if (!success) {
          return {
            success: false,
            message: 'Memory not found or you do not have permission to update it',
          };
        }

        return {
          success: true,
          message: `Memory ${id} updated successfully`,
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to update memory: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    },
  });
}
