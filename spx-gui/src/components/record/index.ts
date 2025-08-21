import RecordEditModal from './RecordEditModal.vue'
import { useConfirmDialog, useModal } from '@/components/ui'
import { deleteRecord } from '@/apis/recording'
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

  return async function removeRecord(id: string, title: string) {
    return withConfirm({
      title: t({ en: `Remove record ${title}`, zh: `删除录屏 ${title}` }),
      content: t({
        en: `Removed records can not be recovered. Are you sure you want to remove record ${title}?`,
        zh: `删除后的录屏无法恢复，确定要删除录屏 ${title} 吗？`
      }),
      confirmHandler: () => deleteRecord(id)
    })
  }
}