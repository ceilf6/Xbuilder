<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRouteQueryParamInt, useRouteQueryParamStrEnum } from '@/utils/route'
import { useMessageHandle } from '@/utils/exception/index'
import { useQuery } from '@/utils/query'
import { usePageTitle } from '@/utils/utils'
import { useEnsureSignedIn } from '@/utils/user'
import { listRecord, type ListRecordParams } from '@/apis/record'
import { getOwnProjectEditorRoute } from '@/router'
import { getSignedInUsername, useUser } from '@/stores/user'
import { UISelect, UISelectOption, UIPagination, UIButton, useResponsive } from '@/components/ui'
import { useCreateProject } from '@/components/project'
import ListResultWrapper from '@/components/common/ListResultWrapper.vue'
import UserContent from '@/components/community/user/content/UserContent.vue'
import RecordItem from '@/components/record/RecordItem.vue'

const props = defineProps<{
  name: string
}>()

const isSignedInUser = computed(() => props.name === getSignedInUsername())

const { data: user } = useUser(() => props.name)
usePageTitle(() => {
  if (user.value == null) return null
  return {
    en: `Records of ${user.value.displayName}`,
    zh: `${user.value.displayName} 的录屏`
  }
})

const isDesktopLarge = useResponsive('desktop-large')
const isMobile = useResponsive('mobile')
const numInRow = computed(() => {
  if (isMobile.value) return 2
  return isDesktopLarge.value ? 5 : 4
})
const pageSize = computed(() => numInRow.value * 2)
const pageTotal = computed(() => Math.ceil((queryRet.data.value?.total ?? 0) / pageSize.value))
const page = useRouteQueryParamInt('p', 1)

enum Order {
  RecentlyUpdated = 'update',
  MostLikes = 'likes',
  ByDuration = 'duration'
}
const order = useRouteQueryParamStrEnum('o', Order, Order.RecentlyUpdated, (kvs) => ({
  ...kvs,
  p: null
}))

const listParams = computed<ListRecordParams>(() => {
  const p: ListRecordParams = {
    owner: props.name,
    pageSize: pageSize.value,
    pageIndex: page.value
  }

  // 注意：Records 不像 Projects 那样有 visibility 参数
  // 因为我们的后端 API 已经在 ListRecords 中处理了权限逻辑

  switch (order.value) {
    case Order.RecentlyUpdated:
      p.orderBy = 'updatedAt'
      p.sortOrder = 'desc'
      break
    case Order.MostLikes:
      p.orderBy = 'likeCount'
      p.sortOrder = 'desc'
      break
    case Order.ByDuration:
      p.orderBy = 'duration'
      p.sortOrder = 'desc'
      break
  }
  return p
})

const queryRet = useQuery(() => listRecord(listParams.value), {
  en: 'Failed to load records',
  zh: '加载录屏失败'
})

const router = useRouter()
const ensureSignedIn = useEnsureSignedIn()
const createProject = useCreateProject()
const handleNewProject = useMessageHandle(
  async () => {
    await ensureSignedIn()
    const name = await createProject()
    router.push(getOwnProjectEditorRoute(name))
  },
  { en: 'Failed to create new record', zh: '新建录屏失败' }
).fn
</script>

<template>
  <UserContent class="user-records" :style="{ '--project-num-in-row': numInRow }">
    <template #title>
      {{ $t({ en: 'My records', zh: '我的录屏' }) }}
    </template>
    <template #extra>
      <label class="sort">
        {{
          $t({
            en: 'Sort by',
            zh: '排序方式'
          })
        }}
        <UISelect v-model:value="order">
          <UISelectOption :value="Order.RecentlyUpdated">{{
            $t({
              en: 'Recently updated',
              zh: '最近更新'
            })
          }}</UISelectOption>
          <UISelectOption :value="Order.MostLikes">{{
            $t({
              en: 'Most likes',
              zh: '最受喜欢'
            })
          }}</UISelectOption>
          <UISelectOption :value="Order.ByDuration">{{
            $t({
              en: 'By duration',
              zh: '按时长'
            })
          }}</UISelectOption>
        </UISelect>
      </label>
      <UIButton
        v-if="isSignedInUser && !isMobile"
        v-radar="{ name: 'New record button', desc: 'Click to create a new record' }"
        type="secondary"
        icon="plus"
        @click="handleNewProject"
      >
        {{ $t({ en: 'New record', zh: '新建录屏' }) }}
      </UIButton>
    </template>
    <div class="records-wrapper">
      <ListResultWrapper v-slot="slotProps" content-type="record" :query-ret="queryRet" :height="524">
        <ul class="records">
          <RecordItem
            v-for="record in slotProps.data.data"
            :key="record.id"
            context="mine"
            :record="record"
            @removed="queryRet.refetch()"
          />
        </ul>
      </ListResultWrapper>
      <UIPagination v-show="pageTotal > 1" v-model:current="page" class="pagination" :total="pageTotal" />
    </div>
  </UserContent>
</template>

<style lang="scss" scoped>
@import '@/components/ui/responsive.scss';

.sort {
  display: flex;
  align-items: center;
  gap: 8px;
  
  @include responsive(mobile) {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}

.records-wrapper {
  margin-top: 8px;
  
  @include responsive(mobile) {
    margin-top: 12px;
  }
}

.records {
  display: grid;
  grid-template-columns: repeat(var(--project-num-in-row), 1fr);
  gap: var(--ui-gap-middle);
  
  @include responsive(mobile) {
    gap: 16px;
  }
}

.pagination {
  margin: 36px 0 20px;
  justify-content: center;
  
  @include responsive(mobile) {
    margin: 24px 0 16px;
  }
}
</style>