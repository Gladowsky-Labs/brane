import { embed } from 'ai';
import { db, memoriesTable } from '@/lib/db';
import { eq, and, desc, sql, cosineDistance } from 'drizzle-orm';
import type { MemorySearchResult } from '../types';

/**
 * Generate embedding for a text string
 * Currently uses 'google/gemini-embedding-001' model, returns 3072-dimensional vector
 */
export async function embedText(text: string): Promise<number[]> {
  const result = await embed({
    model: 'google/gemini-embedding-001',
    value: text,
  });
  return result.embedding;
}

/**
 * Search for memories using vector similarity
 */
export async function searchMemoriesByVector(
  query: string,
  userId: string,
  limit: number = 5
): Promise<MemorySearchResult[]> {
  const queryEmbedding = await embedText(query);

  const similarity = sql<number>`1 - (${cosineDistance(memoriesTable.embedding, queryEmbedding)})`;

  const results = await db
    .select({
      id: memoriesTable.id,
      text: memoriesTable.text,
      similarity,
      createdAt: memoriesTable.createdAt,
    })
    .from(memoriesTable)
    .where(eq(memoriesTable.userId, userId))
    .orderBy(desc(similarity))
    .limit(limit);

  return results;
}

/**
 * Insert a new memory
 */
export async function insertMemory(
  userId: string,
  text: string
): Promise<number> {
  const embedding = await embedText(text);

  const result = await db
    .insert(memoriesTable)
    .values({
      userId,
      text,
      embedding,
    })
    .returning({ id: memoriesTable.id });

  return result[0].id;
}

/**
 * Update an existing memory
 */
export async function updateMemory(
  id: number,
  userId: string,
  text: string
): Promise<boolean> {
  const embedding = await embedText(text);

  const result = await db
    .update(memoriesTable)
    .set({ text, embedding })
    .where(and(eq(memoriesTable.id, id), eq(memoriesTable.userId, userId)))
    .returning({ id: memoriesTable.id });

  return result.length > 0;
}
