import type { ByPage, PaginationParams } from './common'
import { client, Visibility, ownerAll } from './common'

export { Visibility, ownerAll }

export type VideoData = {
  /** Unique identifier */
  id: string
  /** Creation timestamp */
  createdAt: string
  /** Last update timestamp */
  updatedAt: string
  /** Unique username of the user */
  owner: string
  /** Unique name of the video */
  name: string
  /** Title of the video */
  title: string
  /** Brief description of the video */
  description: string
  /** Universal URL of the video file */
  videoUrl: string
  /** Universal URL of the video's thumbnail image, may be empty (`""`) */
  thumbnail: string
  /** Duration of the video in seconds */
  duration: number
  /** Visibility of the video */
  visibility: Visibility
  /** Number of times the video has been viewed */
  viewCount: number
  /** Number of likes the video has received */
  likeCount: number
}

export type ListVideoParams = PaginationParams & {
  /** Filter by video owner */
  owner?: string
  /** Filter by video visibility */
  visibility?: Visibility
  /** Filter by user who liked the video */
  liker?: string
  /** Search by video title or description */
  keyword?: string
  /** Order by field */
  orderBy?: 'createdAt' | 'updatedAt' | 'viewCount' | 'likeCount' | 'duration'
  /** Sort order */
  sortOrder?: 'asc' | 'desc'
}

/**
 * List videos with filters and pagination
 */
export async function listVideo(params: ListVideoParams): Promise<ByPage<VideoData[]>> {
  return client.get('/videos', { params }) as Promise<ByPage<VideoData[]>>
}

/**
 * Get a specific video by owner and name
 */
export async function getVideo(owner: string, name: string): Promise<VideoData> {
  return client.get(`/videos/${owner}/${name}`) as Promise<VideoData>
}

/**
 * Create a new video
 */
export async function createVideo(params: {
  name: string
  title: string
  description?: string
  videoFile: File
  thumbnail?: File
  visibility?: Visibility
}): Promise<VideoData> {
  const formData = new FormData()
  formData.append('name', params.name)
  formData.append('title', params.title)
  if (params.description) formData.append('description', params.description)
  formData.append('video', params.videoFile)
  if (params.thumbnail) formData.append('thumbnail', params.thumbnail)
  if (params.visibility) formData.append('visibility', params.visibility.toString())

  return client.post('/videos', formData) as Promise<VideoData>
}

/**
 * Update video metadata
 */
export async function updateVideo(
  owner: string,
  name: string,
  params: {
    title?: string
    description?: string
    visibility?: Visibility
    thumbnail?: File
  }
): Promise<VideoData> {
  const formData = new FormData()
  if (params.title) formData.append('title', params.title)
  if (params.description) formData.append('description', params.description)
  if (params.visibility) formData.append('visibility', params.visibility.toString())
  if (params.thumbnail) formData.append('thumbnail', params.thumbnail)

  return client.put(`/videos/${owner}/${name}`, formData) as Promise<VideoData>
}

/**
 * Delete a video
 */
export async function deleteVideo(owner: string, name: string): Promise<void> {
  await client.delete(`/videos/${owner}/${name}`)
}

/**
 * Like a video
 */
export async function likeVideo(owner: string, name: string): Promise<void> {
  await client.post(`/videos/${owner}/${name}/like`)
}

/**
 * Unlike a video
 */
export async function unlikeVideo(owner: string, name: string): Promise<void> {
  await client.delete(`/videos/${owner}/${name}/like`)
}

/**
 * Check if current user has liked a video
 */
export async function isLikingVideo(owner: string, name: string): Promise<boolean> {
  const data = await client.get(`/videos/${owner}/${name}/like`) as { isLiking: boolean }
  return data.isLiking
}

/**
 * Record a video view
 */
export async function recordVideoView(owner: string, name: string): Promise<void> {
  await client.post(`/videos/${owner}/${name}/view`)
}
