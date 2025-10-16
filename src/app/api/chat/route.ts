import { openai } from "@ai-sdk/openai";
import {
  streamText,
  UIMessage,
  convertToModelMessages,
  tool,
  stepCountIs,
} from "ai";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    messages: convertToModelMessages(messages),
    system:
      "You are an assistant whos main job is to help Jack with his day to day tasks and anything he could need. He is a student at Northeastern University and you are the main way to keep track of up coming assignments, classes, meetings, and just anything in general going on in his life.",
    stopWhen: stepCountIs(5),
    tools: {
      weather: tool({
        description: "Get the weather in a location (fahrenheit)",
        inputSchema: z.object({
          location: z.string().describe("The location to get the weather for"),
        }),
        execute: async ({ location }) => {
          const temperature = Math.round(Math.random() * (90 - 32) + 32);
          return {
            location,
            temperature,
          };
        },
      }),
      get_classes: tool({
        description: "Get the current classes the user is taking.",
        inputSchema: z.object({}),
        execute: async () => {
          return {
            term: "Fall 2025",
            courses: [
              {
                id: "CS3500",
                title: "Object-Oriented Design",
                location: "West Village H 210",
                schedule: [
                  { day: "Mon", start: "13:35", end: "15:15" },
                  { day: "Thu", start: "13:35", end: "15:15" },
                ],
              },
              {
                id: "CS2810",
                title: "Computer Systems",
                location: "ISEC 140",
                schedule: [
                  { day: "Tue", start: "09:50", end: "11:30" },
                  { day: "Fri", start: "09:50", end: "11:30" },
                ],
              },
              {
                id: "MATH2341",
                title: "Differential Equations and Linear Algebra",
                location: "Richards 254",
                schedule: [
                  { day: "Mon", start: "08:00", end: "09:40" },
                  { day: "Wed", start: "08:00", end: "09:40" },
                ],
              },
            ],
          };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
