import { openai } from "@ai-sdk/openai";
import {
  streamText,
  UIMessage,
  convertToModelMessages,
  tool,
  stepCountIs,
} from "ai";
import { z } from "zod";
import { client } from "@/lib/redis";

export const maxDuration = 30;

const HARD_CODED_USER = "jack";

const scheduleSchema = z
  .array(
    z
      .string()
      .describe(
        'Format "Mon 09:50-11:30 @ ISEC 140" or ' +
          '"Tue 1:30PM-3:00PM @ WVH 210"',
      ),
  )
  .describe("List of meeting strings with location");

function slugify(s: string) {
  return s.trim().replace(/\s+/g, "_");
}

function formatWithTzOffset(d: Date) {
  const pad = (n: number, len = 2) => String(n).padStart(len, "0");
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  // const wd = pad(d.getWeekday());

  // const day

  const tzMin = d.getTimezoneOffset(); // minutes behind UTC; e.g., 240 for EDT
  const sign = tzMin > 0 ? "-" : "+";
  const abs = Math.abs(tzMin);
  const tzh = pad(Math.floor(abs / 60));
  const tzm = pad(abs % 60);

  return `${y}-${m}-${day}T${hh}:${mm}:${ss}${sign}${tzh}:${tzm}`;
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const now = new Date();
  const formattedDate = formatWithTzOffset(now);

  const result = streamText({
    model: openai("gpt-5-nano-2025-08-07"),
    messages: convertToModelMessages(messages),
    system:
      "You are an assistant whos main job is to help Jack with his day to " +
      "day tasks and anything he could need. He is a student at " +
      "Northeastern University and you are the main way to keep track of " +
      "up coming assignments, classes, meetings, and just anything in " +
      "general going on in his life." +
      `The current date is ${formattedDate}`,
    stopWhen: stepCountIs(5),
    tools: {
      add_classes: tool({
        description: "Add a class that the user is taking.",
        inputSchema: z.object({
          term: z
            .string()
            .describe(
              "The term that the student is taking the associated class. " +
                "i.e., Fall 2025, Spring 2021, Summer 2 2023, etc.",
            ),
          id: z
            .string()
            .describe("The id of the course. i.e., CS2500, EECE2250, CY4532"),
          title: z
            .string()
            .describe(
              "The title of the course. i.e., Robotics Sensing and " +
                "Navigation, Object-Oriented Design, etc.",
            ),
          schedule: scheduleSchema,
        }),
        execute: async ({ term, id, title, schedule }) => {
          const termSlug = slugify(term);
          const key = `course:${termSlug}:${id}`;
          const value = {
            term,
            id,
            title,
            schedule,
            createdAt: new Date().toISOString(),
          };

          // Store course JSON
          await client.set(key, JSON.stringify(value));

          // Index under hardcoded user "jack"
          await client.sadd(`user:${HARD_CODED_USER}:classes`, key);
          await client.sadd(
            `user:${HARD_CODED_USER}:classes:term:${termSlug}`,
            key,
          );

          return { ok: true, key, value };
        },
      }),
      get_classes: tool({
        description: "Get the current classes the user is taking.",
        inputSchema: z.object({
          term: z
            .string()
            .optional()
            .describe(
              "Optional term filter, e.g., 'Fall 2025'. If omitted, " +
                "returns all classes.",
            ),
        }),
        execute: async ({ term }) => {
          const termSlug = term ? slugify(term) : null;
          const indexKey = termSlug
            ? `user:${HARD_CODED_USER}:classes:term:${termSlug}`
            : `user:${HARD_CODED_USER}:classes`;

          const keys = await client.smembers(indexKey);
          if (!keys.length) return [];

          const vals = await client.mget(keys);
          return vals
            .filter((v): v is string => Boolean(v))
            .map((v) => JSON.parse(v));
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
