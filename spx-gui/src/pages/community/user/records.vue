<script setup lang="ts">
import { computed } from 'vue'
import { usePageTitle } from '@/utils/utils'
import { getSignedInUsername, useUser } from '@/stores/user'
import { UIButton } from '@/components/ui'
import UserContent from '@/components/community/user/content/UserContent.vue'
import VideoItem from '@/components/video/VideoItem.vue'
import { getMockRecords } from '@/mock/videoData'

const props = defineProps<{
  name: string
}>()

const isSignedInUser = computed(() => props.name === getSignedInUsername())

const { data: user } = useUser(() => props.name)
usePageTitle(() => {
  if (user.value == null) return null
  return {
    en: `Records of ${user.value.displayName}`,
    zh: `${user.value.displayName} 的记录`
  }
})

// Use mock data for now
const records = computed(() => getMockRecords())

const handleRecordSelected = (recordId: string) => {
  // TODO: Implement record player route
  console.log('Selected record:', recordId)
}

const createRecord = () => {
  // TODO: Implement create record functionality
  console.log('Create record')
}
</script>

<template>
  <UserContent>
    <div class="toolbar">
      <UIButton v-if="isSignedInUser" @click="createRecord">
        {{ $t({ en: 'Create record', zh: '创建记录' }) }}
      </UIButton>
    </div>
    <div v-if="records.length" class="list">
      <VideoItem
        v-for="record in records"
        :key="record.id"
        :video="record"
        @selected="handleRecordSelected(record.id)"
      />
    </div>
    <div v-else class="empty-message">
      <span>{{ $t({ en: 'No records yet', zh: '暂无记录' }) }}</span>
    </div>
  </UserContent>
</template>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.empty-message {
  text-align: center;
  color: var(--ui-color-grey-500);
  padding: 40px;
  font-size: 16px;
}
</style>
