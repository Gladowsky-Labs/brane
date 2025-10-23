import { embed } from 'ai';
import { db, eventsTable } from '@/lib/db';
import { eq, and, desc, sql, cosineDistance } from 'drizzle-orm';

export interface EventSearchResult {
  id: number;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  eventType: string;
  status: string;
  location: string | null;
  similarity: number;
  createdAt: Date;
}

export async function embedText(text: string): Promise<number[]> {
  const result = await embed({
    model: process.env.EMBEDDING_MODEL || 'cohere/embed-v4.0',
    value: text,
  });
  return result.embedding;
}

/**
 * Search for events using vector similarity
 */
export async function searchEventsByVector(
  query: string,
  userId: string,
  limit: number = 5
): Promise<EventSearchResult[]> {
  const queryEmbedding = await embedText(query);

  const similarity = sql<number>`1 - (${cosineDistance(eventsTable.embedding, queryEmbedding)})`;

  const results = await db
    .select({
      id: eventsTable.id,
      title: eventsTable.title,
      description: eventsTable.description,
      startTime: eventsTable.startTime,
      endTime: eventsTable.endTime,
      eventType: eventsTable.eventType,
      status: eventsTable.status,
      location: eventsTable.location,
      similarity,
      createdAt: eventsTable.createdAt,
    })
    .from(eventsTable)
    .where(eq(eventsTable.userId, userId))
    .orderBy(desc(similarity))
    .limit(limit);

  return results;
}

export async function insertEvent(
    userId: string,
    title: string,
    description: string,
    date: string,
    location?: string,
    event_type?: string,
): Promise<number> {
    const embedding = await embedText(`${title} ${description} ${date} ${location || ''} ${event_type || ''}`);

    const result = await db
        .insert(eventsTable)
        .values({
            userId,
            title,
            description,
            embedding,
            startTime: new Date(date),
            endTime: new Date(date),
            eventType: event_type || 'reminder',
            location: location || 'none',
        })
        .returning({ id: eventsTable.id });

    return result[0].id;
}

/**
 * Update an existing event
 */
export async function updateEvent(
  id: number,
  userId: string,
  updates: {
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    eventType?: string;
    status?: string;
  }
): Promise<boolean> {
  // If title or description changed, regenerate embedding
  let embedding: number[] | undefined;

  if (updates.title || updates.description) {
    // Get the current event to build complete embedding text
    const currentEvent = await db
      .select()
      .from(eventsTable)
      .where(and(eq(eventsTable.id, id), eq(eventsTable.userId, userId)))
      .limit(1);

    if (currentEvent.length === 0) {
      return false;
    }

    const event = currentEvent[0];
    const embeddingText = `${updates.title || event.title} ${updates.description || event.description || ''} ${updates.startTime || event.startTime.toISOString()} ${updates.location || event.location || ''} ${updates.eventType || event.eventType}`;
    embedding = await embedText(embeddingText);
  }

  const updateData: Record<string, any> = {};

  if (updates.title) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.startTime) updateData.startTime = new Date(updates.startTime);
  if (updates.endTime) updateData.endTime = new Date(updates.endTime);
  if (updates.location !== undefined) updateData.location = updates.location;
  if (updates.eventType) updateData.eventType = updates.eventType;
  if (updates.status) updateData.status = updates.status;
  if (embedding) updateData.embedding = embedding;

  const result = await db
    .update(eventsTable)
    .set(updateData)
    .where(and(eq(eventsTable.id, id), eq(eventsTable.userId, userId)))
    .returning({ id: eventsTable.id });

  return result.length > 0;
}