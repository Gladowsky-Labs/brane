import { tool } from 'ai';
import { z } from 'zod';
import { updateEvent } from './helpers';

/**
 * Create a tool for updating existing events
 */
export function createUpdateEventTool(userId: string) {
  return tool({
    description: 'Update an existing event by ID. Can update title, description, dates, location, type, and status.',
    inputSchema: z.object({
      id: z
        .number()
        .int()
        .positive()
        .describe('The ID of the event to update'),
      title: z
        .string()
        .optional()
        .describe('New title for the event'),
      description: z
        .string()
        .optional()
        .describe('New description for the event'),
      startTime: z
        .string()
        .optional()
        .describe('New start time in ISO format'),
      endTime: z
        .string()
        .optional()
        .describe('New end time in ISO format'),
      location: z
        .string()
        .optional()
        .describe('New location for the event'),
      eventType: z
        .string()
        .optional()
        .describe('New event type (meeting, appointment, assignment, reminder, task)'),
      status: z
        .string()
        .optional()
        .describe('New status (upcoming, completed, cancelled)'),
    }),
    execute: async ({ id, title, description, startTime, endTime, location, eventType, status }) => {
      try {
        const updates: Record<string, any> = {};
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (startTime !== undefined) updates.startTime = startTime;
        if (endTime !== undefined) updates.endTime = endTime;
        if (location !== undefined) updates.location = location;
        if (eventType !== undefined) updates.eventType = eventType;
        if (status !== undefined) updates.status = status;

        if (Object.keys(updates).length === 0) {
          return {
            success: false,
            message: 'No updates provided',
          };
        }

        const success = await updateEvent(id, userId, updates);

        if (!success) {
          return {
            success: false,
            message: 'Event not found or you do not have permission to update it',
          };
        }

        return {
          success: true,
          message: `Event ${id} updated successfully`,
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to update event: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    },
  });
}
