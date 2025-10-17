import { title } from "process";
import { z } from "zod";

export const scheduleItemSchema = z.object({
  byweekday: z.array(z.enum(["MO", "TU", "WE", "TH", "FR", "SA", "SU"])),
  start: z.string().regex(/^\d{2}:\d{2}$/), // "HH:MM"
  end: z.string().regex(/^\d{2}:\d{2}$/),
  location: z.string(),
});

// Tool Schema for Adding a Course
export const addCourseSchema = z.object({
  term: z.string().describe("e.g., Fall 2023, Spring 2024, Summer 2 2023"),
  id: z
    .string()
    .describe(
      "University identifier for the course, e.g., CS101, MATH201, EECE2250",
    ),
  title: z.string().describe("Title of the course"),
  schedule: z
    .array(scheduleItemSchema)
    .describe("Meeting times with locations. Use 24-hour format"),
});

// Tool Schema for getting all courses
export const getCoursesSchema = z.object({
  term: z
    .string()
    .optional()
    .describe(
      "Optional term filter,e.g., Fall 2023, Spring 2024, Summer 2 2023. If not provided, returns courses for all terms.",
    ),
});

// Tool Schema for adding an assignment
export const addAssignmentSchema = z.object({
  courseCode: z
    .string()
    .describe(
      "University course code for the course this assignment belongs to (e.g., CS2500, MATH201)",
    ),
  title: z.string().describe("Title of the assignment"),
  dueDate: z.string().describe("Due date of the assignment, YYYY-MM-DD-HH-MM"),
  description: z
    .string()
    .optional()
    .describe("Optional description of the assignment"),
  priority: z.enum(["low", "medium", "high"]).optional().default("low"),
});

export const getUpcomingAssignmentsSchema = z.object({
  courseCode: z
    .string()
    .optional()
    .describe(
      "Optional: University course code (e.g., CS2500, MATH201). If not provided, returns assignments for all courses.",
    ),
});

export const updateAssignmentSchema = z.object({
  id: z.number().int().positive().describe("ID of the assignment to update"),
  title: z
    .string()
    .optional()
    .describe("New title for the assignment"),
  description: z
    .string()
    .optional()
    .describe("New description for the assignment"),
  dueDate: z
    .string()
    .optional()
    .describe("New due date (YYYY-MM-DD-HH-MM)"),
  status: z
    .enum(["pending", "completed"])
    .optional()
    .describe("New status of the assignment (pending/completed)"),
  priority: z
    .enum(["low", "medium", "high"])
    .optional()
    .describe("New priority level for the assignment"),
});

export type AddCourseInput = z.infer<typeof addCourseSchema>;
export type GetCoursesInput = z.infer<typeof getCoursesSchema>;
export type AddAssignmentInput = z.infer<typeof addAssignmentSchema>;
export type GetUpcomingAssignmentsInput = z.infer<
  typeof getUpcomingAssignmentsSchema
>;
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>;
