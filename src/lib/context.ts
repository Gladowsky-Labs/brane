// src/lib/context.ts
import { getCourses, getAssignments } from "@/lib/db/queries";

export function formatWithTzOffset(d: Date) {
  const pad = (n: number, len = 2) => String(n).padStart(len, "0");
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());

  const tzMin = d.getTimezoneOffset();
  const sign = tzMin > 0 ? "-" : "+";
  const abs = Math.abs(tzMin);
  const tzh = pad(Math.floor(abs / 60));
  const tzm = pad(abs % 60);

  return `${y}-${m}-${day}T${hh}:${mm}:${ss}${sign}${tzh}:${tzm}`;
}

export async function buildContextPrompt() {
  const now = new Date();
  const formattedDate = formatWithTzOffset(now);

  // Fetch once
  const [courses, upcomingAssignments] = await Promise.all([
    getCourses(),
    getAssignments(),
  ]);

  // Build courseId -> courseCode lookup
  // Adjust the key property if your getCourses() returns a different field
  const courseCodeById = new Map<string | number, string>(
    courses.map((c) => [c.id, c.courseCode]),
  );

  const enrolled =
    courses.length > 0
      ? courses.map((c) => `${c.courseCode} (${c.title})`).join(", ")
      : "None";

  const upcoming = upcomingAssignments
    .slice(0, 3)
    .map((a) => {
      const code = courseCodeById.get(a.courseId) ?? "UNKNOWN"; // fallback if data mismatch
      return `${a.title} (${code}) due ${a.dueDate}`;
    })
    .join(", ");

  return `
    Current Context:
    - Today Date: ${formattedDate}
    - Enrolled Courses: ${enrolled}
    - Upcoming Assignments (${upcomingAssignments.length}): ${upcoming}
  `;
}

export function buildSystemPrompt(context: string) {
  return `You are Brane, an AI assistant helping Jack manage his academic life at Northeastern University.
          ${context}
          You help with classes, assignments, meetings, and general organization. Be proactive and helpful.`;
}
