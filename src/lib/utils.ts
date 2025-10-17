export function parseDueDate(input: string): Date {
  const [y, m, d, h, mi] = input.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, h, mi));
}
