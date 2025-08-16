import { useModal } from '@/components/ui'
import RecordEditModal from './RecordEditModal.vue'

export function useEditRecord() {
    const modal = useModal(RecordEditModal)

    return function editRecord(record: any) {
        return modal({ record })
    }
}