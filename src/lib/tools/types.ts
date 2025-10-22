/**
 * Shared types for the tool system
 */

/**
 * Result of a memory search with similarity score
 */
export interface MemorySearchResult {
  id: number;
  text: string;
  similarity: number;
  createdAt: Date;
}
