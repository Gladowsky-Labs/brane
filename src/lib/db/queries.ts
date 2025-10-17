import { db } from "@/lib/db/index";
import {
  termsTable,
  coursesTable,
  assignmentsTable,
  Priority,
} from "@/lib/db/schema";
import { Schedule } from "@/lib/types";

import { eq, and, lte, gte, desc, asc } from "drizzle-orm";

export async function getTerm(term: string) {
  const existing = await db
    .select()
    .from(termsTable)
    .where(eq(termsTable.name, term))
    .limit(1);

  return existing[0] ?? null;
}

export async function createTerm(term: string) {
  const insertedTerm = await db
    .insert(termsTable)
    .values({ name: term })
    .returning();

  return insertedTerm[0] ?? null;
}

export async function getOrCreateTerm(term: string) {
  const existing = await getTerm(term);

  if (!existing) {
    const createdTerm = await createTerm(term);
    if (createdTerm) {
      return createdTerm;
    }
    throw new Error(`Failed to create term: ${term}`);
    // return null;
  } else {
    return existing;
  }
  throw new Error(`Failed to get or create term: ${term}`);
  // return null;
}

export async function getCourse(courseCode: string) {
  const existingCourse = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.courseCode, courseCode))
    .limit(1);

  return existingCourse[0] ?? null;
}

export async function getCourseById(courseId: number) {
  const existingCourse = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.id, courseId))
    .limit(1);

  return existingCourse[0] ?? null;
}

export async function createCourseWithTermName(
  courseCode: string,
  title: string,
  termName: string,
  schedule?: Schedule,
) {
  const term = await getOrCreateTerm(termName);
  if (!term) throw new Error(`Could not resolve term: ${termName}`);

  const [inserted] = await db
    .insert(coursesTable)
    .values({
      courseCode,
      title,
      termId: term.id, // use the term id we get from it.
      ...(schedule ? { schedule } : {}),
    })
    .returning();

  return inserted ?? null;
}

export async function getOrCreateCourse(
  courseCode: string,
  title: string,
  termName: string,
  schedule?: Schedule,
) {
  const course = await getCourse(courseCode);
  if (!course) {
    const createdCourse = await createCourseWithTermName(
      courseCode,
      title,
      termName,
      schedule,
    );
    if (createdCourse) {
      return createdCourse;
    }
    throw new Error(`Failed to create course: ${courseCode}`);
  } else {
    return course;
  }
  throw new Error(`Failed to get or create course: ${courseCode}`);
  // return null;
}

export async function getCourses(termName?: string, courseId?: number) {
  if (termName) {
    const term = await getOrCreateTerm(termName);

    const existingCourses = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.termId, term.id));

    return existingCourses ?? null;
  } else if (courseId) {
    const existingCourses = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.id, courseId));

    return existingCourses ?? null;
  } else {
    const existingCourses = await db.select().from(coursesTable);

    return existingCourses ?? null;
  }
}

export async function convertCourseIdtoCourseCode(courseId: number) {
  const course = await getCourseById(courseId);
  if (!course) {
    throw new Error(`Failed to get course by id: ${courseId}`);
  }

  return course.courseCode;
}

export async function createAssignment(
  courseCode: string,
  title: string,
  dueDate: Date,
  description?: string,
  priority?: Priority,
) {
  const course = await getCourse(courseCode);
  if (!course) {
    throw new Error(`Failed to get course by code: ${courseCode}`);
  }

  const assignment = await db
    .insert(assignmentsTable)
    .values({
      courseId: course.id,
      title,
      dueDate,
      description: description ?? null,
      priority: priority ? priority : null,
    })
    .returning();

  return assignment ?? null;
}

export async function getAssignments(courseCode?: string) {
  if (courseCode) {
    const course = await getCourse(courseCode);
    if (!course) {
      throw new Error(`Failed to get course by code: ${courseCode}`);
    }

    const assignments = await db
      .select()
      .from(assignmentsTable)
      .where(eq(assignmentsTable.courseId, course.id));

    return assignments ?? null;
  } else {
    const assignments = await db.select().from(assignmentsTable);

    return assignments ?? null;
  }
}
