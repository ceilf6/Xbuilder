// spx-gui/src/apis/mobile-adaptation.ts

export type ZoneId = 'lt' | 'rt' | 'lbUp' | 'lbLeft' | 'lbRight' | 'lbDown' | 'rbA' | 'rbB' | 'rbX' | 'rbY'

/**
 * Mobile adaptation data structure returned by the API
 */
export type MobileAdaptationData = {
  /** Unique identifier */
  id: string
  /** Creation timestamp */
  createdAt: string
  /** Last update timestamp */
  updatedAt: string
  /** Full name of the project, in the format `owner/project` */
  projectFullName: string
  /** Adaptation type: 1 = no keyboard needed, 2 = custom keyboard */
  adaptationType: 1 | 2
  /** Zone to key mapping, only present when adaptationType is 2 */
  zoneToKey?: Partial<Record<ZoneId, string | null>>
}

/**
 * Virtual keyboard layout data structure for frontend consumption
 */
export type VirtualKeyboardLayoutData = {
  /** Project identifier */
  projectId: string
  /** Whether mobile adaptation is enabled for this project */
  isMobile: boolean
  /** Zone to key mapping for virtual keyboard rendering */
  zoneToKey: Partial<Record<ZoneId, string | null>>
}

/**
 * Parameters for creating mobile adaptation
 */
export type CreateMobileAdaptationParams = {
  /** Adaptation type: 1 = no keyboard needed, 2 = custom keyboard */
  adaptationType: 1 | 2
  /** Zone to key mapping, required when adaptationType is 2 */
  zoneToKey?: Partial<Record<ZoneId, string | null>>
}

/**
 * Parameters for updating mobile adaptation
 */
export type UpdateMobileAdaptationParams = {
  /** Adaptation type: 1 = no keyboard needed, 2 = custom keyboard */
  adaptationType: 1 | 2
  /** Zone to key mapping, required when adaptationType is 2 */
  zoneToKey?: Partial<Record<ZoneId, string | null>>
}

/**
 * Mobile adaptation management interface
 * Provides CRUD operations for mobile adaptations
 */
export interface MobileAdaptationService {
  /** Create mobile adaptation for a project */
  createMobileAdaptation(owner: string, name: string, params: CreateMobileAdaptationParams, signal?: AbortSignal): Promise<MobileAdaptationData>
  
  /** Get mobile adaptation for a project */
  getMobileAdaptation(owner: string, name: string, signal?: AbortSignal): Promise<MobileAdaptationData>
  
  /** Update mobile adaptation for a project */
  updateMobileAdaptation(owner: string, name: string, params: UpdateMobileAdaptationParams, signal?: AbortSignal): Promise<MobileAdaptationData>
}
