import { tool } from 'ai';
import { z } from 'zod';
import { insertEvent } from './helpers';

export function createStoreEventTool(userId: string) {
  return tool({
    description: 'Store a new event related to the user for future reference. Use this to log significant occurrences, actions, or updates about the user.',
    inputSchema: z.object({
      title: z.string().describe('The title of the event to store'),
      description: z.string().describe('A detailed description of the event'),
      date: z.string().describe('The date of the event in ISO format'),
      location: z.string().optional().describe('The location of the event'),
      event_type: z.string().describe('The type of event. MUST BE ONE OF: meeting, appointment, assignment, reminder, task'),
    }),
    execute: async ({ title, description, date, location, event_type }) => {
      try {
        const eventId = await insertEvent(userId, title, description, date, location, event_type); 
        

        return {
          success: true,
          message: `Event stored successfully with ID ${eventId}`,
          eventId,
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to store event: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    },
  });
}