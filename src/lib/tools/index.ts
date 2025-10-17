import { tool } from "ai";

import {
  addCourseSchema,
  getCoursesSchema,
  addAssignmentSchema,
  getUpcomingAssignmentsSchema,
  updateAssignmentStatusSchema,
} from "./definitions";

import {
  handleAddCourse,
  handleGetCourses,
  handleAddAssignment,
  handleGetUpcomingAssignments,
  handleUpdateAssignmentStatus,
} from "./handlers";

export const tools = {
  addCourse: tool({
    description: "Add a new course",
    inputSchema: addCourseSchema,
    execute: handleAddCourse,
  }),
  getCourses: tool({
    description: "Get all courses",
    inputSchema: getCoursesSchema,
    execute: handleGetCourses,
  }),
  addAssignment: tool({
    name: "add_assignment",
    description: "Add a new assignment",
    inputSchema: addAssignmentSchema,
    execute: handleAddAssignment,
  }),
  getUpcomingAssignments: tool({
    name: "get_upcoming_assignments",
    description: "Get upcoming assignments",
    inputSchema: getUpcomingAssignmentsSchema,
    execute: handleGetUpcomingAssignments,
  }),
  updateAssignmentStatus: tool({
    name: "update_assignment_status",
    description: "Update the status of an assignment",
    inputSchema: updateAssignmentStatusSchema,
    execute: handleUpdateAssignmentStatus,
  }),
};
