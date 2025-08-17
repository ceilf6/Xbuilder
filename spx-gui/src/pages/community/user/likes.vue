<script setup lang="ts">
import { computed } from 'vue'
import { useRouteQueryParamInt } from '@/utils/route'
import { useQuery } from '@/utils/query'
import { usePageTitle } from '@/utils/utils'
import { Visibility, listProject, ownerAll } from '@/apis/project'
import { listRecord } from '@/apis/record' // 添加导入
import { useUser } from '@/stores/user'
import { UIPagination, useResponsive } from '@/components/ui'
import ListResultWrapper from '@/components/common/ListResultWrapper.vue'
import UserContent from '@/components/community/user/content/UserContent.vue'
import ProjectItem from '@/components/project/ProjectItem.vue'
import RecordItem from '@/components/record/RecordItem.vue' // 添加导入

const props = defineProps<{
  name: string
}>()

const { data: user } = useUser(() => props.name)
usePageTitle(() => {
  if (user.value == null) return null
  return {
    en: `What ${user.value.displayName} likes`,
    zh: `${user.value.displayName} 喜欢的内容`
  }
})

const isDesktopLarge = useResponsive('desktop-large')
const isMobile = useResponsive('mobile')
const numInRow = computed(() => {
  if (isMobile.value) return 2
  return isDesktopLarge.value ? 5 : 4
})
const pageSize = computed(() => numInRow.value * 2)
const page = useRouteQueryParamInt('p', 1)

// 项目查询（原有逻辑）
const projectsPageTotal = computed(() => Math.ceil((projectsQueryRet.data.value?.total ?? 0) / pageSize.value))
const projectsQueryRet = useQuery(
  () =>
    listProject({
      visibility: Visibility.Public,
      owner: ownerAll,
      liker: props.name,
      orderBy: 'likedAt',
      sortOrder: 'desc',
      pageSize: pageSize.value,
      pageIndex: page.value
    }),
  {
    en: 'Failed to load projects',
    zh: '加载失败'
  }
)

// 录屏查询（新增）
const recordsQueryRet = useQuery(
  () =>
    listRecord({
      owner: '*',
      liker: props.name,
      orderBy: 'likedAt',
      sortOrder: 'desc',
      pageSize: numInRow.value, // 概览显示，使用较少数量
      pageIndex: 1
    }),
  {
    en: 'Failed to load records',
    zh: '加载录屏失败'
  }
)
</script>

<template>
  <UserContent class="user-likes" :style="{ '--project-num-in-row': numInRow }">
    <template #title>
      {{ $t({ en: 'What I like', zh: '我喜欢的内容' }) }}
    </template>
    
    <!-- 我喜欢的项目 -->
    <div class="section">
      <h3 class="section-title">
        {{ $t({ en: 'Projects I like', zh: '我喜欢的项目' }) }}
      </h3>
      <div class="projects-wrapper">
        <ListResultWrapper v-slot="slotProps" content-type="project" :query-ret="projectsQueryRet" :height="524">
          <ul class="projects">
            <ProjectItem v-for="project in slotProps.data.data" :key="project.id" :project="project" />
          </ul>
        </ListResultWrapper>
        <UIPagination v-show="projectsPageTotal > 1" v-model:current="page" class="pagination" :total="projectsPageTotal" />
      </div>
    </div>

    <!-- 我喜欢的录屏 -->
    <div class="section">
      <h3 class="section-title">
        {{ $t({ en: 'Records I like', zh: '我喜欢的录屏' }) }}
      </h3>
      <div class="records-wrapper">
        <ListResultWrapper v-slot="slotProps" content-type="record" :query-ret="recordsQueryRet" :height="350">
          <ul class="records">
            <RecordItem v-for="record in slotProps.data.data" :key="record.id" :record="record" />
          </ul>
        </ListResultWrapper>
        <!-- 录屏部分不需要分页，只显示概览 -->
      </div>
    </div>
  </UserContent>
</template>

<style lang="scss" scoped>
@import '@/components/ui/responsive.scss';

.section {
  &:not(:first-child) {
    margin-top: 19px;
  }
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: var(--ui-color-title);
}

.projects-wrapper {
  margin-top: 8px;
}

.records-wrapper {
  margin-top: 8px;
}

.projects,
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