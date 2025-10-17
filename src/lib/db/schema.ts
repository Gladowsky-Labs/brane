// src/lib/db/schema.ts
import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  jsonb,
  date,
  integer,
} from "drizzle-orm/pg-core";

import { Schedule } from "@/lib/types";

// Terms table
export const termsTable = pgTable("terms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // "Fall 2025"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Courses table
export const coursesTable = pgTable("courses", {
  id: serial("id").primaryKey(),
  termId: integer("term_id")
    .notNull()
    .references(() => termsTable.id, { onDelete: "cascade" }),
  courseCode: text("course_code").notNull(), // "CS2500"
  title: text("title").notNull(),
  schedule: jsonb("schedule").$type<Schedule>(), // Array of meeting times
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Assignments table
export const assignmentsTable = pgTable("assignments", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id")
    .notNull()
    .references(() => coursesTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  completed: boolean("completed").notNull().default(false),
  priority: text("priority", { enum: ["low", "medium", "high"] }).default(
    "low",
  ),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Meetings table
export const meetingsTable = pgTable("meetings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  location: text("location"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  recurrenceRule: text("recurrence_rule"), // For recurring meetings (RFC 5545)
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Tasks table (non-course-related todos)
export const tasksTable = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  completed: boolean("completed").notNull().default(false),
  priority: text("priority", { enum: ["low", "medium", "high"] }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Memory/context table (for LLM memory)
export const memoriesTable = pgTable("memories", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  category: text("category"), // "preference", "fact", "reminder", etc.
  // embedding: vector("embedding", { dimensions: 1536 }), // For semantic search later
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Type exports
export type InsertTerm = typeof termsTable.$inferInsert;
export type SelectTerm = typeof termsTable.$inferSelect;

export type InsertCourse = typeof coursesTable.$inferInsert;
export type SelectCourse = typeof coursesTable.$inferSelect;

export type InsertAssignment = typeof assignmentsTable.$inferInsert;
export type SelectAssignment = typeof assignmentsTable.$inferSelect;

export type InsertMeeting = typeof meetingsTable.$inferInsert;
export type SelectMeeting = typeof meetingsTable.$inferSelect;

export type InsertTask = typeof tasksTable.$inferInsert;
export type SelectTask = typeof tasksTable.$inferSelect;

export type InsertMemory = typeof memoriesTable.$inferInsert;
export type SelectMemory = typeof memoriesTable.$inferSelect;

export type Priority = SelectAssignment["priority"];
