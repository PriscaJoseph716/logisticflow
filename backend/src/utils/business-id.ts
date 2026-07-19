export function createBusinessIdentifier(companyName: string) {
  const slug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);

  const uniqueSuffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return {
    slug: slug || `business-${uniqueSuffix.toLowerCase()}`,
    businessId: `BUS-${uniqueSuffix}`,
  };
}
