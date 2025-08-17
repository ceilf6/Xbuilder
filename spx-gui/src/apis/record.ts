import type { ByPage, PaginationParams } from './common'
import { client, ownerAll, Visibility } from './common'
import type { ProjectData } from './project'

export { Visibility, ownerAll }

export type RecordData = {
    /** Unique identifier */
    id: string
    /** Creation timestamp */
    createdAt: string
    /** Last update timestamp */
    updatedAt: string
    /** Unique username of the user who created the record */
    owner: string
    /** ID of the associated project */
    projectId: number
    /** Associated project data (optional, included in some contexts) */
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

export type CreateRecordParams = {
    /** ID of the project that the record is associated with */
    projectId: number
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
}

export async function createRecord(params: CreateRecordParams, signal?: AbortSignal) {
    return client.post('/records', params, { signal }) as Promise<RecordData>
}

export type UpdateRecordParams = Partial<Pick<RecordData, 'title' | 'description' | 'visibility'>>

export async function updateRecord(owner: string, name: string, params: UpdateRecordParams, signal?: AbortSignal) {
    return client.put(`/record/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`, params, {
        signal
    }) as Promise<RecordData>
}

export function deleteRecord(owner: string, name: string) {
    return client.delete(`/record/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`) as Promise<void>
}

export type ListRecordParams = PaginationParams & {
    /**
     * Filter records by the owner's username.
     * Defaults to the authenticated user if not specified. Use * to include records from all users.
     **/
    owner?: string
    /** Filter records by associated project (format: owner/project) */
    projectFullName?: string
    /** Filter records by name pattern */
    keyword?: string
    /** Field by which to order the results */
    orderBy?: 'createdAt' | 'updatedAt' | 'duration' | 'viewCount' | 'likeCount' | 'likedAt'
    /** Order in which to sort the results */
    sortOrder?: 'asc' | 'desc'
    /** Filter records liked by the specified user */
    liker?: string
}

export async function listRecord(params?: ListRecordParams) {
    return client.get('/records/list', params) as Promise<ByPage<RecordData>>
}

export async function getRecord(owner: string, name: string, signal?: AbortSignal) {
    return client.get(`/record/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`, undefined, {
        signal
    }) as Promise<RecordData>
}
// export async function getRecord(owner: string, name: string): Promise<RecordData> {
//     return client.get(`/records/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`) as Promise<RecordData>
// }

/** Record a view for the given record */
export async function recordRecordView(owner: string, name: string) {
    return client.post(`/record/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/view`) as Promise<void>
}

/**
 * Check if given record liked by current logged-in user.
 * If not logged in, `false` will be returned.
 */
export async function isLikingRecord(owner: string, name: string) {
    try {
        await client.get(`/record/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/liking`)
        return true
    } catch (e) {
        // Handle API exceptions similar to project.ts
        // Not liked or not logged in
        return false
    }
}

/** Like given record as current logged-in user */
export async function likeRecord(owner: string, name: string) {
    return client.post(`/record/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/liking`) as Promise<void>
}

/** Unlike given record as current logged-in user */
export async function unlikeRecord(owner: string, name: string) {
    return client.delete(`/record/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/liking`) as Promise<void>
}

export function parseRecordFullName(fullName: string) {
    const [encodedOwner, encodedName] = fullName.split('/')
    const owner = decodeURIComponent(encodedOwner)
    const name = decodeURIComponent(encodedName)
    return { owner, name }
}

export function stringifyRecordFullName(owner: string, name: string) {
    const encodedOwner = encodeURIComponent(owner)
    const encodedName = encodeURIComponent(name)
    return `${encodedOwner}/${encodedName}`
}