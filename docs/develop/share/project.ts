// Project type definition - simplified for this module
interface Project {
    id?: string
    name?: string
}
import { 
    startRecording, 
    stopRecording, 
    getRecordingState, 
    RecordingState,
    type RecordingConfig 
} from './record'

/**
 * Project recording integration module
 * Provides recording functionality for projects with UI controls
 */

/**
 * Project recording configuration
 */
export interface ProjectRecordingConfig extends RecordingConfig {
    /** Project identifier */
    projectId: string
    /** Auto-save recording to project */
    autoSave?: boolean
    /** Generate thumbnail from first frame */
    generateThumbnail?: boolean
    /** Recording quality preset */
    qualityPreset?: 'low' | 'medium' | 'high'
}

/**
 * Project recording controller
 * Manages recording state and provides UI integration
 */
export class ProjectRecordingController {
    private project: Project
    private isRecording: boolean = false
    private recordingConfig: ProjectRecordingConfig

    constructor(project: Project, config?: Partial<ProjectRecordingConfig>) {
        this.project = project
        this.recordingConfig = {
            projectId: project.id || 'unknown',
            quality: 0.8,
            frameRate: 30,
            format: 'webm',
            autoDownload: false,
            filename: `project_${project.name || 'recording'}`,
            autoSave: false,
            generateThumbnail: true,
            qualityPreset: 'medium',
            ...config
        }
    }

    /**
     * Get current recording state
     */
    getRecordingState(): RecordingState {
        return getRecordingState()
    }

    /**
     * Check if currently recording
     */
    isCurrentlyRecording(): boolean {
        return this.isRecording
    }

    /**
     * Start recording the project
     */
    async startProjectRecording(): Promise<void> {
        if (this.isRecording) {
            throw new Error('Project recording already in progress')
        }

        try {
            // Apply quality preset if specified
            const config = this.applyQualityPreset()
            
            // Start recording
            await startRecording(config)
            this.isRecording = true
            
            console.log(`Started recording project: ${this.project.name}`)
        } catch (error) {
            console.error('Failed to start project recording:', error)
            throw error
        }
    }

    /**
     * Stop recording the project
     */
    async stopProjectRecording(): Promise<Blob> {
        if (!this.isRecording) {
            throw new Error('No project recording in progress')
        }

        try {
            // Stop recording
            const videoBlob = await stopRecording()
            this.isRecording = false
            
            console.log(`Stopped recording project: ${this.project.name}`)
            
            // Auto-save if configured
            if (this.recordingConfig.autoSave) {
                await this.saveProjectRecording(videoBlob)
            }
            
            return videoBlob
        } catch (error) {
            console.error('Failed to stop project recording:', error)
            this.isRecording = false
            throw error
        }
    }

    /**
     * Toggle recording state (start/stop)
     */
    async toggleRecording(): Promise<Blob | void> {
        if (this.isRecording) {
            return await this.stopProjectRecording()
        } else {
            await this.startProjectRecording()
        }
    }

    /**
     * Cancel current recording
     */
    async cancelRecording(): Promise<void> {
        if (!this.isRecording) {
            return
        }

        try {
            // Note: This would need to be implemented in the recording service
            // For now, we just stop and discard
            await stopRecording()
            this.isRecording = false
            console.log('Project recording cancelled')
        } catch (error) {
            console.error('Failed to cancel recording:', error)
            this.isRecording = false
        }
    }

    /**
     * Save recording to project storage
     */
    private async saveProjectRecording(videoBlob: Blob): Promise<void> {
        try {
            // Create a unique filename for the project
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
            const filename = `${this.project.name}_${timestamp}.${this.recordingConfig.format}`
            
            // Save to project storage (implementation depends on storage system)
            console.log(`Saving recording to project: ${filename}`)
            
            // TODO: Implement project storage integration
            // await this.project.saveRecording(filename, videoBlob)
            
        } catch (error) {
            console.error('Failed to save recording to project:', error)
        }
    }

    /**
     * Apply quality preset configuration
     */
    private applyQualityPreset(): RecordingConfig {
        const baseConfig = { ...this.recordingConfig }
        
        switch (this.recordingConfig.qualityPreset) {
            case 'low':
                return {
                    ...baseConfig,
                    quality: 0.3,
                    frameRate: 15
                }
            case 'medium':
                return {
                    ...baseConfig,
                    quality: 0.6,
                    frameRate: 24
                }
            case 'high':
                return {
                    ...baseConfig,
                    quality: 0.9,
                    frameRate: 30
                }
            default:
                return baseConfig
        }
    }

    /**
     * Get recording configuration
     */
    getRecordingConfig(): ProjectRecordingConfig {
        return { ...this.recordingConfig }
    }

    /**
     * Update recording configuration
     */
    updateRecordingConfig(config: Partial<ProjectRecordingConfig>): void {
        this.recordingConfig = { ...this.recordingConfig, ...config }
    }
}

/**
 * Create a project recording controller for the given project
 */
export function createProjectRecordingController(
    project: Project, 
    config?: Partial<ProjectRecordingConfig>
): ProjectRecordingController {
    return new ProjectRecordingController(project, config)
}

/**
 * Utility function to check if recording is supported
 */
export function isRecordingSupported(): boolean {
    return typeof window !== 'undefined' && 
           typeof (window as any).startRecording === 'function' &&
           typeof (window as any).stopRecording === 'function'
}

/**
 * Get recommended recording configuration for the project
 */
export function getRecommendedRecordingConfig(project: Project): ProjectRecordingConfig {
    return {
        projectId: project.id || 'unknown',
        quality: 0.7,
        frameRate: 24,
        format: 'webm',
        autoDownload: true,
        filename: `project_${project.name || 'recording'}`,
        autoSave: true,
        generateThumbnail: true,
        qualityPreset: 'medium'
    }
}

// ProjectRecordingConfig interface is already defined above