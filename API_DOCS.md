# Database Query API Documentation

Quick reference for all database query functions in `src/lib/db/queries.ts`

## Terms

### `getTerm(term: string)`
Retrieves a term by name. Returns the term object or `null` if not found.

### `createTerm(term: string)`
Creates a new term with the given name. Returns the created term object or `null`.

### `getOrCreateTerm(term: string)`
Gets an existing term or creates it if it doesn't exist. Throws error if both operations fail.

## Courses

### `getCourse(courseCode: string)`
Retrieves a course by its course code. Returns the course object or `null` if not found.

### `getCourseById(courseId: number)`
Retrieves a course by its numeric ID. Returns the course object or `null` if not found.

### `createCourseWithTermName(courseCode: string, title: string, termName: string, schedule?: Schedule)`
Creates a new course with the given details. Auto-creates the term if it doesn't exist. Returns the created course object or `null`.

### `getOrCreateCourse(courseCode: string, title: string, termName: string, schedule?: Schedule)`
Gets an existing course by code or creates it if it doesn't exist. Throws error if both operations fail.

### `getCourses(termName?: string, courseId?: number)`
Retrieves courses with optional filters:
- No params: Returns all courses
- `termName`: Returns courses for a specific term
- `courseId`: Returns courses matching the ID

### `convertCourseIdtoCourseCode(courseId: number)`
Converts a course ID to its course code string. Throws error if course not found.

## Assignments

### `createAssignment(courseCode: string, title: string, dueDate: Date, description?: string, priority?: Priority)`
Creates a new assignment for a course. Throws error if course not found. Returns the created assignment object or `null`.

### `getAssignments(courseCode?: string)`
Retrieves assignments:
- No params: Returns all assignments
- `courseCode`: Returns assignments for a specific course

## Types

- `Schedule`: Defined in `src/lib/types.ts`
- `Priority`: Defined in `src/lib/db/schema.ts`
