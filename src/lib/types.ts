import { z } from "zod";

export type Weekday = "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";

export type ScheduleItem = {
  byweekday: Weekday[];
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  location: string;
};

export type Schedule = ScheduleItem[];
