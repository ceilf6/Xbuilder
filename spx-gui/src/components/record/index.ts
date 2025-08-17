import RecordEditModal from './RecordEditModal.vue'
import { useConfirmDialog,useModal } from '@/components/ui'
import { deleteRecord } from '@/apis/record'
import { useI18n } from '@/utils/i18n'

export function useEditRecord() {
    const modal = useModal(RecordEditModal)

    return function editRecord(record: any) {
        return modal({ record })
    }
}

export function useRemoveRecord() {
    const { t } = useI18n()
    const withConfirm = useConfirmDialog()
  
    return async function removeRecord(owner: string, name: string) {
      return withConfirm({
        title: t({ en: `Remove record ${name}`, zh: `删除录屏 ${name}` }),
        content: t({
          en: `Removed records can not be recovered. Are you sure you want to remove record ${name}?`,
          zh: `删除后的录屏无法恢复，确定要删除录屏 ${name} 吗？`
        }),
        confirmHandler: () => deleteRecord(owner, name)
      })
    }
  }