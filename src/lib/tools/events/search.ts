import { tool } from 'ai';
import { z } from 'zod';
import { searchEventsByVector } from './helpers';

/**
 * Create a tool for searching events
 */
export function createSearchEventsTool(userId: string) {
  return tool({
    description: 'Search for relevant events using semantic search. Returns events ranked by relevance to the query.',
    inputSchema: z.object({
      query: z
        .string()
        .describe('The search query to find relevant events'),
      limit: z
        .number()
        .min(1)
        .max(20)
        .optional()
        .describe('Maximum number of events to return (default: 5)'),
    }),
    execute: async ({ query, limit = 5 }) => {
      try {
        const events = await searchEventsByVector(
          query,
          userId,
          limit
        );

        if (events.length === 0) {
          return {
            success: true,
            message: 'No relevant events found',
            events: [],
          };
        }

        // Format events for display
        const formatted = events.map((e) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          startTime: e.startTime.toISOString(),
          endTime: e.endTime.toISOString(),
          eventType: e.eventType,
          status: e.status,
          location: e.location,
          similarity: Math.round(e.similarity * 100),
          createdAt: e.createdAt.toISOString(),
        }));

        return {
          success: true,
          message: `Found ${events.length} relevant ${events.length === 1 ? 'event' : 'events'}`,
          events: formatted,
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to search events: ${error instanceof Error ? error.message : 'Unknown error'}`,
          events: [],
        };
      }
    },
  });
}
