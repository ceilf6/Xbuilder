import { client } from './common'

export type ZoneId = 'lt' | 'rt' | 'lbUp' | 'lbLeft' | 'lbRight' | 'lbDown' | 'rbA' | 'rbB' | 'rbX' | 'rbY'

export type MobileAdaptation = {
  /** Unique identifier */
  id: string
  /** Creation timestamp */
  createdAt: string
  /** Last update timestamp */
  updatedAt: string
  /** Full name of the project, in the format `owner/project`. */
  projectFullName: string
  /** Adaptation type: 1 = no keyboard needed, 2 = custom keyboard */
  adaptationType: 1 | 2
  /** Zone to key mapping, only present when adaptationType is 2 */
  zoneToKey?: Partial<Record<ZoneId, string | null>>
}

export type CreateMobileAdaptationParams = {
  /** Adaptation type: 1 = no keyboard needed, 2 = custom keyboard */
  adaptationType: 1 | 2
  /** Zone to key mapping, required when adaptationType is 2 */
  zoneToKey?: Partial<Record<ZoneId, string | null>>
}

export type UpdateMobileAdaptationParams = {
  /** Adaptation type: 1 = no keyboard needed, 2 = custom keyboard */
  adaptationType: 1 | 2
  /** Zone to key mapping, required when adaptationType is 2 */
  zoneToKey?: Partial<Record<ZoneId, string | null>>
}

export type LayoutPayload = {
  projectId: string
  isMobile: boolean
  zoneToKey: Partial<Record<ZoneId, string | null>>
}

/**
 * Create mobile adaptation for a project
 */
export function createMobileAdaptation(
  owner: string, 
  name: string, // 改为 name 以匹配后端路由
  params: CreateMobileAdaptationParams,
  signal?: AbortSignal
) {
  return client.post(
    `/project/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/mobile-adaptation`,
    params,
    { signal }
  ) as Promise<MobileAdaptation>
}

/**
 * Get mobile adaptation for a project
 */
export function getMobileAdaptation(
  owner: string, 
  name: string, // 改为 name 以匹配后端路由
  signal?: AbortSignal
) {
  return client.get(
    `/project/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/mobile-adaptation`,
    undefined,
    { signal }
  ) as Promise<MobileAdaptation>
}

/**
 * Update mobile adaptation for a project
 */
export function updateMobileAdaptation(
  owner: string, 
  name: string, // 改为 name 以匹配后端路由
  params: UpdateMobileAdaptationParams,
  signal?: AbortSignal
) {
  return client.put(
    `/project/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/mobile-adaptation`,
    params,
    { signal }
  ) as Promise<MobileAdaptation>
}

/**
 * Delete mobile adaptation for a project
 */
export function deleteMobileAdaptation(
  owner: string, 
  name: string, // 改为 name 以匹配后端路由
  signal?: AbortSignal
) {
  return client.delete(
    `/project/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/mobile-adaptation`,
    undefined,
    { signal }
  ) as Promise<void>
}

/**
 * Get virtual keyboard layout for frontend virtual keyboard component
 * This is the main API that frontend virtual keyboard will call
 */
export function getVirtualKeyboardLayout(
  projectId: string,
  signal?: AbortSignal
) {
  return client.get(
    `/projects/${encodeURIComponent(projectId)}/virtual-keyboard-layout`,
    undefined,
    { signal }
  ) as Promise<LayoutPayload>
}

/**
 * Parse project full name from string
 */
export function parseProjectFullName(fullName: string) {
  const [encodedOwner, encodedName] = fullName.split('/') // 改为 name
  const owner = decodeURIComponent(encodedOwner)
  const name = decodeURIComponent(encodedName) // 改为 name
  return { owner, name } // 改为 name
}

/**
 * Stringify project full name
 */
export function stringifyProjectFullName(owner: string, name: string) { // 改为 name
  const encodedOwner = encodeURIComponent(owner)
  const encodedName = encodeURIComponent(name) // 改为 name
  return `${encodedOwner}/${encodedName}` // 改为 name
}

/**
 * Check if adaptation type needs keyboard
 */
export function needsKeyboard(adaptationType: MobileAdaptation['adaptationType']): boolean {
  return adaptationType === 2
}

/**
 * Get all valid zone IDs
 */
export function getAllZoneIds(): ZoneId[] {
  return ['lt', 'rt', 'lbUp', 'lbLeft', 'lbRight', 'lbDown', 'rbA', 'rbB', 'rbX', 'rbY']
}

/**
 * Validate zone to key mapping
 */
export function validateZoneToKey(
  zoneToKey: Partial<Record<ZoneId, string | null>>,
  adaptationType: MobileAdaptation['adaptationType']
): { valid: boolean; error?: string } {
  if (adaptationType === 1) {
    // No keyboard needed, zoneToKey should be empty
    if (Object.keys(zoneToKey).length > 0) {
      return { valid: false, error: 'zoneToKey must be empty when adaptationType is 1 (no keyboard)' }
    }
  } else if (adaptationType === 2) {
    // Custom keyboard, zoneToKey is required
    if (Object.keys(zoneToKey).length === 0) {
      return { valid: false, error: 'zoneToKey is required when adaptationType is 2 (custom keyboard)' }
    }
    
    // Validate zone IDs
    const validZoneIds = getAllZoneIds()
    for (const zone in zoneToKey) {
      if (!validZoneIds.includes(zone as ZoneId)) {
        return { valid: false, error: `Invalid zone ID: ${zone}` }
      }
    }
  }
  
  return { valid: true }
}