/**
 * Tools
 * Central location for all tools available to the agent
 */

import { searchInternetTool } from './search-internet';
import { createStoreMemoryTool } from './memories/store';
import { createSearchMemoriesTool } from './memories/search';
import { createUpdateMemoryTool } from './memories/update';
import { createStoreEventTool } from './events/store';
import { createSearchEventsTool } from './events/search';
import { createUpdateEventTool } from './events/update';

/**
 * Create a toolset for a specific user
 * Returns all tools with user context baked in where needed
 */
export function createToolset(userId: string) {
  return {
    searchInternet: searchInternetTool,
    storeMemory: createStoreMemoryTool(userId),
    searchMemories: createSearchMemoriesTool(userId),
    updateMemory: createUpdateMemoryTool(userId),
    storeEvent: createStoreEventTool(userId),
    searchEvents: createSearchEventsTool(userId),
    updateEvent: createUpdateEventTool(userId),
  };
}

/**
 * Type for the toolset - useful for type inference
 */
export type Toolset = ReturnType<typeof createToolset>;
