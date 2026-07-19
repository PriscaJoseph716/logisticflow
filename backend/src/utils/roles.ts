export const OWNER_PERMISSIONS = [
  "users:manage",
  "users:view",
  "roles:manage",
  "assignments:manage",
  "assignments:view",
  "deliveries:view",
  "deliveries:complete",
  "deliveries:upload",
  "maintenance:view",
  "maintenance:create",
  "maintenance:edit",
  "maintenance:delete",
  "maintenance:approve",
  "maintenance:export",
  "maintenance:complete",
  "maintenance:upload",
] as const;

export const DEFAULT_ROLE_TEMPLATES = [
  {
    name: "Driver",
    description: "Complete assigned deliveries and maintenance drop-offs with proof uploads.",
    permissions: [
      "deliveries:view",
      "deliveries:complete",
      "deliveries:upload",
      "maintenance:view",
      "maintenance:upload",
      "assignments:view",
    ],
    isSystem: true,
  },
  {
    name: "Dispatcher",
    description: "Coordinate deliveries and assign work to drivers.",
    permissions: [
      "deliveries:view",
      "assignments:manage",
      "assignments:view",
      "users:view",
    ],
    isSystem: true,
  },
] as const;

/** System roles that used to be seeded and should be removed. */
export const RETIRED_SYSTEM_ROLES = ["Mechanic"] as const;

export const AVAILABLE_PERMISSIONS = [
  { key: "deliveries:view", label: "View deliveries" },
  { key: "deliveries:complete", label: "Complete deliveries" },
  { key: "deliveries:upload", label: "Upload delivery proof" },
  { key: "maintenance:view", label: "View maintenance" },
  { key: "maintenance:complete", label: "Complete maintenance" },
  { key: "maintenance:upload", label: "Upload maintenance proof" },
  { key: "assignments:view", label: "View own assignments" },
  { key: "assignments:manage", label: "Assign work to workers" },
  { key: "users:view", label: "View team members" },
  { key: "users:manage", label: "Manage workers" },
  { key: "roles:manage", label: "Manage roles" },
] as const;

export function parsePermissions(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function stringifyPermissions(permissions: string[]): string {
  return JSON.stringify([...new Set(permissions)]);
}
