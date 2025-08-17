<script setup lang="ts">
import { ref } from 'vue'
import { useUser } from '@/stores/user'
import { UIError } from '@/components/ui'
import { useResponsive } from '@/components/ui/responsive'
import CenteredWrapper from '@/components/community/CenteredWrapper.vue'
import UserHeader from '@/components/community/user/UserHeader.vue'
import UserSidebar from '@/components/community/user/sidebar/UserSidebar.vue'

const props = defineProps<{
  name: string
}>()

const { data: user, error, refetch } = useUser(() => props.name)
const isMobile = useResponsive('mobile')

// 侧边栏状态管理
const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}
</script>

<template>
  <CenteredWrapper class="user-page" size="large">
    <UIError v-if="error != null" class="error" :retry="refetch">
      {{ $t(error.userMessage) }}
    </UIError>
    <template v-else-if="user != null">
      <UserHeader :user="user" />
      <div class="main">
        <UserSidebar 
          v-if="!isMobile || isSidebarOpen"
          class="sidebar" 
          :username="name" 
          @close="closeSidebar"
        />
        <div class="content">
          <router-view />
        </div>
      </div>
      
      <!-- 移动端侧边栏展开按钮 -->
      <div v-if="isMobile && !isSidebarOpen" class="mobile-sidebar-toggle" @click="toggleSidebar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </template>
  </CenteredWrapper>
</template>

<style lang="scss" scoped>
@import '@/components/ui/responsive.scss';

.user-page {
  flex: 1 0 auto;
  padding: 24px 0 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
}

.error {
  flex: 1 1 0;
  display: flex;

  border-radius: var(--ui-border-radius-2);
  background: var(--ui-color-grey-100);
}

.main {
  display: flex;
  align-items: flex-start;
  gap: 20px;

  .sidebar {
    flex: 0 0 auto;
  }
  .content {
    flex: 1 1 0;
    min-width: 0;
  }
}

.mobile-sidebar-toggle {
  position: fixed;
  bottom: 30%;
  left: 16px;
  width: 48px;
  height: 48px;
  background-color: var(--ui-color-primary-main);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 999;
  
  &:hover {
    background-color: var(--ui-color-primary-dark);
  }
}
</style>
