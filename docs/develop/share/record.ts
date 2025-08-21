/**
 * Recording Module Implementation
 * 
 * This file contains the concrete implementation of the Recording module interfaces.
 * It provides screen recording functionality by integrating with the SPX runner.
 */

import type { RecordData, CreateRecordParams } from './module_RecordDB'
import { createRecord } from './impl_RecordDB'

/**
 * Recording state enumeration
 */
export enum RecordingState {
    IDLE = 'idle',
    RECORDING = 'recording',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    ERROR = 'error'
}

/**
 * Recording configuration options
 */
export interface RecordingConfig {
    /** Video quality (0.1 to 1.0) */
    quality?: number
    /** Frame rate (fps) */
    frameRate?: number
    /** Video format */
    format?: 'webm' | 'mp4'
    /** Auto download after recording */
    autoDownload?: boolean
    /** Filename for downloaded video */
    filename?: string
}

/**
 * Recording session information
 */
export interface RecordingSession {
    id: string
    state: RecordingState
    startTime?: number
    endTime?: number
    duration?: number
    videoBlob?: Blob
    error?: string
}

/**
 * Recording service interface
 */
export interface RecordingService {
    /** Start recording */
    startRecording(config?: RecordingConfig): Promise<void>
    
    /** Stop recording and get video blob */
    stopRecording(): Promise<Blob>
    
    /** Get current recording state */
    getRecordingState(): RecordingState
    
    /** Get current recording session */
    getCurrentSession(): RecordingSession | null
    
    /** Pause recording (if supported) */
    pauseRecording(): Promise<void>
    
    /** Resume recording (if supported) */
    resumeRecording(): Promise<void>
    
    /** Cancel current recording */
    cancelRecording(): Promise<void>
    
    /** Download recorded video */
    downloadVideo(filename?: string): Promise<void>
    
    /** Save recording to cloud storage */
    saveRecording(params: CreateRecordParams): Promise<RecordData>
}

/**
 * Recording service implementation
 */
class RecordingServiceImpl implements RecordingService {
    private currentSession: RecordingSession | null = null
    private config: RecordingConfig = {
        quality: 0.8,
        frameRate: 30,
        format: 'webm',
        autoDownload: false,
        filename: 'spx_recording'
    }

    constructor() {
        this.initializeRunnerIntegration()
    }

    /**
     * Initialize integration with SPX runner
     */
    private initializeRunnerIntegration(): void {
        // Wait for runner to be ready
        if (typeof window !== 'undefined') {
            window.addEventListener('runnerReady', () => {
                console.log('SPX Runner ready for recording')
            })
        }
    }

    /**
     * Check if runner is available
     */
    private isRunnerAvailable(): boolean {
        return typeof window !== 'undefined' && 
               typeof (window as any).startRecording === 'function' &&
               typeof (window as any).stopRecording === 'function'
    }

    /**
     * Start recording with the specified configuration
     */
    async startRecording(config?: RecordingConfig): Promise<void> {
        if (!this.isRunnerAvailable()) {
            throw new Error('SPX Runner not available for recording')
        }

        if (this.currentSession?.state === RecordingState.RECORDING) {
            throw new Error('Recording already in progress')
        }

        // Pause the game before starting recording
        try {
            if (typeof (window as any).pauseGame === 'function') {
                (window as any).pauseGame()
                console.log('Game paused for recording')
            }
        } catch (error) {
            console.warn('Failed to pause game:', error)
        }

        // Update configuration
        if (config) {
            this.config = { ...this.config, ...config }
        }

        // Create new recording session
        this.currentSession = {
            id: `recording_${Date.now()}`,
            state: RecordingState.RECORDING,
            startTime: Date.now()
        }

        try {
            // Call runner's startRecording method
            ;(window as any).startRecording()
            
            console.log('Recording started')
        } catch (error) {
            this.currentSession.state = RecordingState.ERROR
            this.currentSession.error = error instanceof Error ? error.message : 'Unknown error'
            throw error
        }
    }

    /**
     * Stop recording and return video blob
     */
    async stopRecording(): Promise<Blob> {
        if (!this.isRunnerAvailable()) {
            throw new Error('SPX Runner not available for recording')
        }

        if (!this.currentSession || this.currentSession.state !== RecordingState.RECORDING) {
            throw new Error('No active recording to stop')
        }

        this.currentSession.state = RecordingState.PROCESSING
        this.currentSession.endTime = Date.now()

        try {
            // Call runner's stopRecording method
            const videoBlob = await (window as any).stopRecording()
            
            if (!videoBlob || !(videoBlob instanceof Blob)) {
                throw new Error('Invalid video blob returned from runner')
            }

            this.currentSession.videoBlob = videoBlob
            this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime!
            this.currentSession.state = RecordingState.COMPLETED

            // Auto download if configured
            if (this.config.autoDownload) {
                await this.downloadVideo()
            }

            // Resume the game after recording stops
            try {
                if (typeof (window as any).resumeGame === 'function') {
                    (window as any).resumeGame()
                    console.log('Game resumed after recording')
                }
            } catch (error) {
                console.warn('Failed to resume game:', error)
            }

            console.log('Recording stopped successfully')
            return videoBlob
        } catch (error) {
            this.currentSession.state = RecordingState.ERROR
            this.currentSession.error = error instanceof Error ? error.message : 'Unknown error'
            throw error
        }
    }

    /**
     * Get current recording state
     */
    getRecordingState(): RecordingState {
        return this.currentSession?.state || RecordingState.IDLE
    }

    /**
     * Get current recording session
     */
    getCurrentSession(): RecordingSession | null {
        return this.currentSession
    }

    /**
     * Pause recording (if supported by runner)
     */
    async pauseRecording(): Promise<void> {
        if (!this.isRunnerAvailable()) {
            throw new Error('SPX Runner not available for recording')
        }

        if (this.currentSession?.state !== RecordingState.RECORDING) {
            throw new Error('No active recording to pause')
        }

        try {
            // Note: Runner may not support pause, this is a placeholder
            console.log('Recording paused')
        } catch (error) {
            throw new Error('Pause recording not supported')
        }
    }

    /**
     * Resume recording (if supported by runner)
     */
    async resumeRecording(): Promise<void> {
        if (!this.isRunnerAvailable()) {
            throw new Error('SPX Runner not available for recording')
        }

        if (this.currentSession?.state !== RecordingState.RECORDING) {
            throw new Error('No active recording to resume')
        }

        try {
            // Note: Runner may not support resume, this is a placeholder
            console.log('Recording resumed')
        } catch (error) {
            throw new Error('Resume recording not supported')
        }
    }

    /**
     * Cancel current recording
     */
    async cancelRecording(): Promise<void> {
        if (!this.currentSession || this.currentSession.state === RecordingState.IDLE) {
            return
        }

        try {
            if (this.currentSession.state === RecordingState.RECORDING) {
                // Stop recording to get the blob, then discard it
                await this.stopRecording()
            }
            
            // Reset session
            this.currentSession = null
            console.log('Recording cancelled')
        } catch (error) {
            console.error('Error cancelling recording:', error)
            this.currentSession = null
        }
    }

    /**
     * Download recorded video
     */
    async downloadVideo(filename?: string): Promise<void> {
        if (!this.currentSession?.videoBlob) {
            throw new Error('No video available for download')
        }

        const downloadFilename = filename || this.config.filename || 'spx_recording'
        
        try {
            // Use runner's download method if available
            if (typeof (window as any).downloadRecordedVideo === 'function') {
                (window as any).downloadRecordedVideo(downloadFilename)
            } else {
                // Fallback to manual download
                const url = URL.createObjectURL(this.currentSession.videoBlob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${downloadFilename}.${this.config.format}`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
            }
            
            console.log('Video downloaded successfully')
        } catch (error) {
            throw new Error(`Failed to download video: ${error}`)
        }
    }

    /**
     * Save recording to cloud storage
     */
    async saveRecording(params: CreateRecordParams): Promise<RecordData> {
        if (!this.currentSession?.videoBlob) {
            throw new Error('No video available for saving')
        }

        try {
            // Create record in the database
            const record = await createRecord(params)
            console.log('Recording saved to cloud storage')
            return record
        } catch (error) {
            throw new Error(`Failed to save recording: ${error}`)
        }
    }
}

// Create and export recording service instance
const recordingService = new RecordingServiceImpl()

// Export service functions
export const startRecording = recordingService.startRecording.bind(recordingService)
export const stopRecording = recordingService.stopRecording.bind(recordingService)
export const getRecordingState = recordingService.getRecordingState.bind(recordingService)
export const getCurrentSession = recordingService.getCurrentSession.bind(recordingService)
export const pauseRecording = recordingService.pauseRecording.bind(recordingService)
export const resumeRecording = recordingService.resumeRecording.bind(recordingService)
export const cancelRecording = recordingService.cancelRecording.bind(recordingService)
export const downloadVideo = recordingService.downloadVideo.bind(recordingService)
export const saveRecording = recordingService.saveRecording.bind(recordingService)

// Types and enums are already exported from the class definitions above

/**
 * Get the recording service instance
 */
export function getRecordingService(): RecordingService {
    return recordingService
}
