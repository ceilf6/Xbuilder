<script setup lang="ts">
import { computed } from 'vue'
import { getUserPageRoute } from '@/router'
import { useQuery } from '@/utils/query'
import { usePageTitle } from '@/utils/utils'
import { Visibility, listProject, ownerAll } from '@/apis/project'
import { getSignedInUsername, useUser } from '@/stores/user'
import { useResponsive } from '@/components/ui'
import CommunityCard from '@/components/community/CommunityCard.vue'
import ProjectsSection from '@/components/community/ProjectsSection.vue'
import ProjectItem from '@/components/project/ProjectItem.vue'
import MyProjectsEmpty from '@/components/community/MyProjectsEmpty.vue'
import MyRecordsEmpty from '@/components/community/MyRecordsEmpty.vue'
import { listRecord } from '@/apis/recording'
import RecordItem from '@/components/record/RecordItem.vue'

const props = defineProps<{
  name: string
}>()

const isDesktopLarge = useResponsive('desktop-large')
const isMobile = useResponsive('mobile')
const numInRow = computed(() => {
  if (isMobile.value) return 2
  return isDesktopLarge.value ? 5 : 4
})
const isSignedInUser = computed(() => props.name === getSignedInUsername())

const { data: user } = useUser(() => props.name)
usePageTitle(() => {
  if (user.value == null) return null
  return {
    en: `User ${user.value.displayName}`,
    zh: `用户 ${user.value.displayName}`
  }
})

const projectsRoute = computed(() => {
  const projectsNum = projectsRet.data.value?.length ?? 0
  if (projectsNum === 0) return null
  return getUserPageRoute(props.name, 'projects')
})

const projectsRet = useQuery(
  async () => {
    const { data: projects } = await listProject({
      owner: props.name,
      pageIndex: 1,
      pageSize: numInRow.value,
      orderBy: 'updatedAt',
      sortOrder: 'desc'
    })
    return projects
  },
  { en: 'Failed to load projects', zh: '加载失败' }
)

const likesRoute = computed(() => {
  return getUserPageRoute(props.name, 'likes')
})

const likesRet = useQuery(
  async () => {
    const { data: likes } = await listProject({
      visibility: Visibility.Public,
      owner: ownerAll,
      liker: props.name,
      orderBy: 'likedAt',
      sortOrder: 'desc',
      pageIndex: 1,
      pageSize: numInRow.value
    })
    return likes
  },
  { en: 'Failed to load likes', zh: '加载失败' }
)
// 添加录屏相关的路由和查询
const recordsRoute = computed(() => {
  const recordsNum = recordsRet.data.value?.length ?? 0
  if (recordsNum === 0) return null
  return getUserPageRoute(props.name, 'records')
})

const recordsRet = useQuery(
  async () => {
    const { data: records } = await listRecord({
      owner: props.name,
      pageIndex: 1,
      pageSize: numInRow.value,
      orderBy: 'updatedAt',
      sortOrder: 'desc'
    })
    return records
  },
  { en: 'Failed to load records', zh: '加载录屏失败' }
)

// const likedRecordsRoute = computed(() => {
//   return getUserPageRoute(props.name, 'records') // 或者将来可能会有专门的 liked-records 页面
// })

const likedRecordsRet = useQuery(
  async () => {
    const { data: likedRecords } = await listRecord({
      owner: '*',  // 查询所有用户
      liker: props.name,  // 指定点赞者
      orderBy: 'likedAt',  // 按点赞时间排序
      sortOrder: 'desc',
      pageIndex: 1,
      pageSize: numInRow.value
    })
    return likedRecords
  },
  { en: 'Failed to load liked records', zh: '加载喜欢的录屏失败' }
)
</script>

<template>
  <div class="user-overview">
    <CommunityCard class="card">
      <ProjectsSection v-radar="{ name: 'User projects', desc: 'Section showing user\'s projects' }" context="user"
        :num-in-row="numInRow" :query-ret="projectsRet" :link-to="projectsRoute">
        <template #title>
          {{
            $t({
              en: 'My projects',
              zh: '我的项目'
            })
          }}
        </template>
        <template #link>
          {{
            $t({
              en: 'View all',
              zh: '查看所有'
            })
          }}
        </template>
        <template v-if="isSignedInUser" #empty="emptyProps">
          <MyProjectsEmpty :style="emptyProps.style" />
        </template>
        <ProjectItem v-for="project in projectsRet.data.value" :key="project.id" context="mine" :project="project"
          @removed="projectsRet.refetch()" />
      </ProjectsSection>
    </CommunityCard>
    <CommunityCard class="card">
      <ProjectsSection v-radar="{ name: 'User records', desc: 'Section showing user\'s records' }" context="user"
        :num-in-row="numInRow" :query-ret="recordsRet" :link-to="recordsRoute" content-type="record">
        <template #title>
          {{
            $t({
              en: 'My records',
              zh: '我的录屏'
            })
          }}
        </template>
        <template #link>
          {{
            $t({
              en: 'View all',
              zh: '查看所有'
            })
          }}
        </template>
        <template v-if="isSignedInUser" #empty="emptyProps">
          <MyRecordsEmpty :style="emptyProps.style" />
        </template>
        <!-- 改为使用 RecordItem -->
        <RecordItem v-for="record in recordsRet.data.value" :key="record.id" context="mine" :record="record"
          @removed="recordsRet.refetch()" />
      </ProjectsSection>
    </CommunityCard>
    <CommunityCard class="card">
      <ProjectsSection v-radar="{ name: 'User liked projects', desc: 'Section showing projects liked by this user' }"
        context="user" :num-in-row="numInRow" :query-ret="likesRet" :link-to="likesRoute">
        <template #title>
          {{
            $t({
              en: 'Projects I like',
              zh: '我喜欢的项目'
            })
          }}
        </template>
        <template #link>
          {{
            $t({
              en: 'View all',
              zh: '查看所有'
            })
          }}
        </template>
        <ProjectItem v-for="project in likesRet.data.value" :key="project.id" :project="project" />
      </ProjectsSection>
    </CommunityCard>
    <CommunityCard class="card">
      <ProjectsSection v-radar="{ name: 'User liked records', desc: 'Section showing records liked by this user' }"
        context="user" :num-in-row="numInRow" :query-ret="likedRecordsRet" :link-to="likesRoute" content-type="record">
        <template #title>
          {{
            $t({
              en: 'Records I like',
              zh: '我喜欢的录屏'
            })
          }}
        </template>
        <template #link>
          {{
            $t({
              en: 'View all',
              zh: '查看所有'
            })
          }}
        </template>
        <RecordItem v-for="record in likedRecordsRet.data.value" :key="record.id" context="public" :record="record" />
      </ProjectsSection>
    </CommunityCard>
  </div>
</template>

<style lang="scss" scoped>
.user-overview {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  padding: 0 var(--ui-gap-middle);
}
</style>
