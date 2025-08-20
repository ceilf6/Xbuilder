/**
 * Record Module Implementation
 * 
 * This file contains the concrete implementation of the Record module interfaces.
 * It provides the actual business logic and API integration.
 */

import { client, ownerAll } from '../../../spx-gui/src/apis/common'
import type { ByPage } from '../../../spx-gui/src/apis/common'
import { ApiException, ApiExceptionCode } from '../../../spx-gui/src/apis/common/exception'
import type {
    RecordData,
    CreateRecordParams,
    UpdateRecordParams,
    ListRecordParams,
    RecordIdentifier,
    RecordService,
    RecordInteractionService,
    RecordUtils,
    Record as IRecord
} from './module_RecordDB'

// ============================================================================
// Utility Implementation
// ============================================================================

class RecordUtilsImpl implements RecordUtils {
    parseRecordFullName(fullName: string): RecordIdentifier {
        const [encodedOwner, encodedName] = fullName.split('/')
        const owner = decodeURIComponent(encodedOwner)
        const name = decodeURIComponent(encodedName)
        return { owner, name }
    }

    stringifyRecordFullName(owner: string, name: string): string {
        const encodedOwner = encodeURIComponent(owner)
        const encodedName = encodeURIComponent(name)
        return `${encodedOwner}/${encodedName}`
    }

    private buildRecordUrl(owner: string, name: string, suffix: string = ''): string {
        const fullName = this.stringifyRecordFullName(owner, name)
        return `/record/${fullName}${suffix}`
    }

    // Expose buildRecordUrl for internal use
    getBuildRecordUrl() {
        return this.buildRecordUrl.bind(this)
    }
}

// ============================================================================
// Record Service Implementation
// ============================================================================

class RecordServiceImpl implements RecordService {
    private utils = new RecordUtilsImpl()
    private buildRecordUrl = this.utils.getBuildRecordUrl()

    async createRecord(params: CreateRecordParams, signal?: AbortSignal): Promise<RecordData> {
        return client.post('/records', params, { signal }) as Promise<RecordData>
    }

    async getRecord(owner: string, name: string, signal?: AbortSignal): Promise<RecordData> {
        const url = this.buildRecordUrl(owner, name)
        return client.get(url, undefined, { signal }) as Promise<RecordData>
    }

    async updateRecord(
        owner: string, 
        name: string, 
        params: UpdateRecordParams, 
        signal?: AbortSignal
    ): Promise<RecordData> {
        const url = this.buildRecordUrl(owner, name)
        return client.put(url, params, { signal }) as Promise<RecordData>
    }

    async deleteRecord(owner: string, name: string): Promise<void> {
        const url = this.buildRecordUrl(owner, name)
        return client.delete(url) as Promise<void>
    }

    async listRecord(params?: ListRecordParams): Promise<ByPage<RecordData>> {
        return client.get('/records/list', params) as Promise<ByPage<RecordData>>
    }
}

// ============================================================================
// Record Interaction Service Implementation
// ============================================================================

class RecordInteractionServiceImpl implements RecordInteractionService {
    private utils = new RecordUtilsImpl()
    private buildRecordUrl = this.utils.getBuildRecordUrl()

    async recordRecordView(owner: string, name: string): Promise<void> {
        const url = this.buildRecordUrl(owner, name, '/view')
        return client.post(url) as Promise<void>
    }

    async isLikingRecord(owner: string, name: string): Promise<boolean> {
        try {
            const url = this.buildRecordUrl(owner, name, '/liking')
            await client.get(url)
            return true
        } catch (e) {
            if (e instanceof ApiException) {
                if (e.code === ApiExceptionCode.errorNotFound) return false
                if (e.code === ApiExceptionCode.errorUnauthorized) return false
                throw e
            }
            return false
        }
    }

    async likeRecord(owner: string, name: string): Promise<void> {
        const url = this.buildRecordUrl(owner, name, '/liking')
        return client.post(url) as Promise<void>
    }

    async unlikeRecord(owner: string, name: string): Promise<void> {
        const url = this.buildRecordUrl(owner, name, '/liking')
        return client.delete(url) as Promise<void>
    }
}

// ============================================================================
// Main Record Module Implementation
// ============================================================================

class RecordImpl implements IRecord {
    private recordService = new RecordServiceImpl()
    private interactionService = new RecordInteractionServiceImpl()
    private utils = new RecordUtilsImpl()

    // RecordService methods
    createRecord = this.recordService.createRecord.bind(this.recordService)
    getRecord = this.recordService.getRecord.bind(this.recordService)
    updateRecord = this.recordService.updateRecord.bind(this.recordService)
    deleteRecord = this.recordService.deleteRecord.bind(this.recordService)
    listRecord = this.recordService.listRecord.bind(this.recordService)

    // RecordInteractionService methods
    recordRecordView = this.interactionService.recordRecordView.bind(this.interactionService)
    isLikingRecord = this.interactionService.isLikingRecord.bind(this.interactionService)
    likeRecord = this.interactionService.likeRecord.bind(this.interactionService)
    unlikeRecord = this.interactionService.unlikeRecord.bind(this.interactionService)

    // RecordUtils methods
    parseRecordFullName = this.utils.parseRecordFullName.bind(this.utils)
    stringifyRecordFullName = this.utils.stringifyRecordFullName.bind(this.utils)

    // Service getters
    getRecordService(): RecordService {
        return this.recordService
    }

    getInteractionService(): RecordInteractionService {
        return this.interactionService
    }

    getUtils(): RecordUtils {
        return this.utils
    }
}

// ============================================================================
// Module Factory & Exports
// ============================================================================

/**
 * Create a new Record module instance
 */
export function createRecordModule(): IRecord {
    return new RecordImpl()
}

/**
 * Default Record module instance
 */
export const record = createRecordModule()

// ============================================================================
// Legacy API Exports (for backward compatibility)
// ============================================================================

export const createRecord = record.createRecord
export const getRecord = record.getRecord
export const updateRecord = record.updateRecord
export const deleteRecord = record.deleteRecord
export const listRecord = record.listRecord
export const recordRecordView = record.recordRecordView
export const isLikingRecord = record.isLikingRecord
export const likeRecord = record.likeRecord
export const unlikeRecord = record.unlikeRecord
export const parseRecordFullName = record.parseRecordFullName
export const stringifyRecordFullName = record.stringifyRecordFullName

// Re-exports
export { ownerAll } from '../../../spx-gui/src/apis/common'