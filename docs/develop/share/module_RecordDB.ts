/**
 * Record Module Interface Definition
 * 
 * This file defines the interfaces and types for the Record module.
 * It specifies what functionality the Record module should provide,
 * but does not contain implementation details.
 */

import type { ByPage, PaginationParams } from '../../../spx-gui/src/apis/common'
import { Visibility } from '../../../spx-gui/src/apis/common'
import type { ProjectData } from '../../../spx-gui/src/apis/project'

// ============================================================================
// Core Data Types
// ============================================================================

/**
 * Record data structure
 */
export type RecordData = {
    /** Unique identifier */
    id: string
    /** Creation timestamp */
    createdAt: string
    /** Last update timestamp */
    updatedAt: string
    /** Username of the user who created the record */
    owner: string
    /** ID of the associated project */
    projectId: number
    /** Associated project data (optional) */
    project?: ProjectData
    /** Unique name of the record under the user */
    name: string
    /** Display title of the record */
    title: string
    /** Brief description of the record */
    description: string
    /** URL of the recorded video file */
    videoUrl: string
    /** URL of the thumbnail image */
    thumbnailUrl: string
    /** Duration of the video in seconds */
    duration: number
    /** Size of the video file in bytes */
    fileSize: number
    /** Visibility of the record */
    visibility: Visibility
    /** Number of times the record has been viewed */
    viewCount: number
    /** Number of likes the record has received */
    likeCount: number
}

/**
 * Parameters for creating a new record
 */
export type CreateRecordParams = {
    projectId: number
    name: string
    title: string
    description: string
    videoUrl: string
    thumbnailUrl: string
    duration: number
    fileSize: number
}

/**
 * Parameters for updating an existing record
 */
export type UpdateRecordParams = Partial<Pick<RecordData, 'title' | 'description' | 'visibility'>>

/**
 * Parameters for listing records
 */
export type ListRecordParams = PaginationParams & {
    owner?: string
    projectFullName?: string
    keyword?: string
    orderBy?: 'createdAt' | 'updatedAt' | 'duration' | 'viewCount' | 'likeCount' | 'likedAt'
    sortOrder?: 'asc' | 'desc'
    liker?: string
}

/**
 * Record identifier
 */
export type RecordIdentifier = {
    owner: string
    name: string
}

// ============================================================================
// Core Interfaces
// ============================================================================

/**
 * Record management interface
 * Provides CRUD operations for records
 */
export interface RecordService {
    /** Create a new record */
    createRecord(params: CreateRecordParams, signal?: AbortSignal): Promise<RecordData>
    
    /** Get a specific record */
    getRecord(owner: string, name: string, signal?: AbortSignal): Promise<RecordData>
    
    /** Update an existing record */
    updateRecord(owner: string, name: string, params: UpdateRecordParams, signal?: AbortSignal): Promise<RecordData>
    
    /** Delete a record */
    deleteRecord(owner: string, name: string): Promise<void>
    
    /** List records with filtering and pagination */
    listRecord(params?: ListRecordParams): Promise<ByPage<RecordData>>
}

/**
 * Record interaction interface
 * Provides social features like views and likes
 */
export interface RecordInteractionService {
    /** Record a view for the specified record */
    recordRecordView(owner: string, name: string): Promise<void>
    
    /** Check if current user has liked the record */
    isLikingRecord(owner: string, name: string): Promise<boolean>
    
    /** Like the record */
    likeRecord(owner: string, name: string): Promise<void>
    
    /** Unlike the record */
    unlikeRecord(owner: string, name: string): Promise<void>
}

/**
 * Record utility interface
 * Provides helper functions for record name handling
 */
export interface RecordUtils {
    /** Parse full name into components */
    parseRecordFullName(fullName: string): RecordIdentifier
    
    /** Convert components to full name */
    stringifyRecordFullName(owner: string, name: string): string
}

/**
 * Main Record module interface
 * Combines all record-related functionality
 */
export interface Record extends RecordService, RecordInteractionService, RecordUtils {
    /** Get the record service instance */
    getRecordService(): RecordService
    
    /** Get the interaction service instance */
    getInteractionService(): RecordInteractionService
    
    /** Get the utility functions */
    getUtils(): RecordUtils
}