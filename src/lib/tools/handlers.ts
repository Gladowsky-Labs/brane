import { db } from "@/lib/db/index";
import { redis } from "@/lib/redis";

import { eq } from "drizzle-orm";

import { coursesTable, assignmentsTable } from "@/lib/db/schema";
import {
  AddCourseInput,
  GetCoursesInput,
  AddAssignmentInput,
  GetUpcomingAssignmentsInput,
  UpdateAssignmentStatusInput,
} from "./definitions";

import {
  getOrCreateTerm,
  getOrCreateCourse,
  getCourses,
  getCourse,
  createAssignment,
  getAssignments,
  updateAssignmentStatus,
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

export async function handleUpdateAssignmentStatus(
  input: UpdateAssignmentStatusInput,
) {
  const { id, status } = input;

  if (status === "completed") {
    const assignment = await updateAssignmentStatus(id, true);
    return assignment;
  } else if (status === "pending") {
    const assignment = await updateAssignmentStatus(id, false);
    return assignment;
  } else {
    throw new Error(`Invalid status: ${status}`);
  }
}
