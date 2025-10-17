import { db } from "@/lib/db/index";
import { redis } from "@/lib/redis";

import { eq } from "drizzle-orm";

import { coursesTable, assignmentsTable } from "@/lib/db/schema";
import {
  AddCourseInput,
  GetCoursesInput,
  AddAssignmentInput,
  GetUpcomingAssignmentsInput,
  UpdateAssignmentInput,
} from "./definitions";

import {
  getOrCreateTerm,
  getOrCreateCourse,
  getCourses,
  getCourse,
  createAssignment,
  getAssignments,
  updateAssignment,
} from "@/lib/db/queries";

import { parseDueDate } from "@/lib/utils";

export async function handleAddCourse(input: AddCourseInput) {
  const { term, id, title, schedule } = input;

  // get or create existing term
  const existingTerm = await getOrCreateTerm(term);

  const course = await getOrCreateCourse(
    id,
    title,
    existingTerm.name,
    schedule,
  );

  return course;
}

export async function handleGetCourses(input: GetCoursesInput) {
  const { term } = input;

  const courses = await getCourses(term);
  if (!courses) {
    throw new Error(`Failed to get courses by term: ${term}`);
  }

  return courses;
}

export async function handleAddAssignment(input: AddAssignmentInput) {
  const { courseCode, title, dueDate, description, priority } = input;

  const course = await getCourse(courseCode);
  if (!course) {
    throw new Error(`Failed to get course by code: ${courseCode}`);
  }

  const parsedDate = parseDueDate(dueDate);

  const assignment = await createAssignment(
    courseCode,
    title,
    parsedDate,
    description,
    priority,
  );

  return assignment;
}

export async function handleGetUpcomingAssignments(
  input: GetUpcomingAssignmentsInput,
) {
  const { courseCode } = input;

  const assignments = await getAssignments(courseCode);
  if (!assignments) {
    return [];
  }

  return assignments;
}

export async function handleUpdateAssignment(input: UpdateAssignmentInput) {
  const { id, title, description, dueDate, status, priority } = input;

  // Build updates object with only provided fields
  const updates: Partial<{
    title: string;
    description: string | null;
    dueDate: Date;
    completed: boolean;
    priority: "low" | "medium" | "high" | null;
  }> = {};

  if (title !== undefined) {
    updates.title = title;
  }

  if (description !== undefined) {
    updates.description = description;
  }

  if (dueDate !== undefined) {
    updates.dueDate = parseDueDate(dueDate);
  }

  if (status !== undefined) {
    updates.completed = status === "completed";
  }

  if (priority !== undefined) {
    updates.priority = priority;
  }

  // Ensure at least one field is being updated
  if (Object.keys(updates).length === 0) {
    throw new Error("No fields provided to update");
  }

  const assignment = await updateAssignment(id, updates);
  return assignment;
}
