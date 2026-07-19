export function formatBusinessId(sequence: number): string {
  return `LOG-${String(sequence).padStart(4, "0")}`;
}

export function normalizeBusinessId(input: string): string {
  return input.trim().toUpperCase();
}

export function slugifyCompanyName(companyName: string): string {
  const slug = companyName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return slug || "business";
}
