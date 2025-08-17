<template>
    <UIFormModal
      :radar="{ name: 'Record edit modal', desc: 'Modal for editing record details' }"
      :title="$t({ en: `Edit ${record.title}`, zh: `编辑 ${record.title}` })"
      :style="{ width: '560px' }"
      :visible="props.visible"
      @update:visible="handleCancel"
    >
      <UIForm :form="form" has-success-feedback @submit="handleSubmit.fn">
        <UIFormItem :label="$t({ en: 'Recording title', zh: '录屏标题' })" path="title">
          <UITextInput
            v-model:value="form.value.title"
            v-radar="{ name: 'Record title input', desc: 'Input field for record title' }"
            :placeholder="$t({ en: 'Enter recording title', zh: '请输入录屏标题' })"
          />
        </UIFormItem>
        <UIFormItem :label="$t({ en: 'Recording description', zh: '录屏描述' })" path="description">
          <UITextInput
            v-model:value="form.value.description"
            v-radar="{ name: 'Record description input', desc: 'Input field for record description' }"
            type="textarea"
            :placeholder="
              $t({
                en: 'Describe what happens in this recording...',
                zh: '描述一下这个录屏的内容...'
              })
            "
            :rows="4"
          />
        </UIFormItem>
        <footer class="footer">
          <UIButton
            v-radar="{ name: 'Cancel button', desc: 'Cancel editing' }"
            class="cancel-button"
            @click="handleCancel"
          >
            {{ $t({ en: 'Cancel', zh: '取消' }) }}
          </UIButton>
          <UIButton
            v-radar="{ name: 'Save button', desc: 'Save record changes' }"
            class="save-button"
            type="primary"
            html-type="submit"
            :loading="handleSubmit.isLoading.value"
          >
            {{ $t({ en: 'Save', zh: '保存' }) }}
          </UIButton>
        </footer>
      </UIForm>
    </UIFormModal>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  import {
    UIButton,
    UIForm,
    UIFormItem,
    UIFormModal,
    UITextInput,
    useForm,
    type FormValidationResult
  } from '@/components/ui'
  import { updateRecord, type RecordData } from '@/apis/record'
  import { useI18n } from '@/utils/i18n'
  import { useMessageHandle } from '@/utils/exception'
  
  const props = defineProps<{
    record: RecordData
    visible: boolean
  }>()
  
  const emit = defineEmits<{
    cancelled: []
    resolved: [updatedRecord: RecordData]
  }>()
  
  const { t } = useI18n()
  
  const form = useForm({
    title: [props.record.title, validateTitle],
    description: [props.record.description, validateDescription]
  })
  
  function handleCancel() {
    // 重置表单到初始值
    form.value.title = props.record.title
    form.value.description = props.record.description
    emit('cancelled')
  }
  
  const handleSubmit = useMessageHandle(
  async () => {    
    try {
      const updatedRecord = await updateRecord(
        props.record.owner,
        props.record.name,
        {
          title: form.value.title.trim(),
          description: form.value.description.trim()
        }
      )
      emit('resolved', updatedRecord)
      return updatedRecord
    } catch (error) {
      console.error('API调用失败:', error)
      throw error
    }
  },
  { en: 'Failed to update recording', zh: '更新录屏失败' },
  { en: 'Recording updated successfully', zh: '录屏更新成功' }
)
  
  function validateTitle(title: string): FormValidationResult {
    const trimmedTitle = title.trim()
    
    if (trimmedTitle === '') {
      return t({ en: 'Recording title is required', zh: '录屏标题不能为空' })
    }
    
    if (trimmedTitle.length > 100) {
      return t({
        en: 'Title is too long (maximum 100 characters)',
        zh: '标题过长（最多100个字符）'
      })
    }
    
    return null
  }
  
  function validateDescription(description: string): FormValidationResult {
    const trimmedDescription = description.trim()
    
    if (trimmedDescription.length > 1000) {
      return t({
        en: 'Description is too long (maximum 1000 characters)',
        zh: '描述过长（最多1000个字符）'
      })
    }
    
    return null
  }
  </script>
  
  <style scoped lang="scss">
  .footer {
    margin-top: 32px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
  </style>