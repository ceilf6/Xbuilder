<template>
  <nav v-radar="{ name: 'Navbar', desc: 'Top navigation bar' }" class="top-nav">
    <div class="content" :class="{ centered }">
      <div class="left">
        <NavbarLogo />
        <div class="left-content">
          <slot name="left"></slot>
          <NavbarLang />
          <NavbarTutorials v-if="showTutorialsEntry" />
        </div>
      </div>
      <div class="center">
        <slot name="center"></slot>
      </div>
      <div class="right">
        <slot name="right"></slot>
        <NavbarProfile />
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { showTutorialsEntry } from '@/utils/env'
import NavbarLogo from './NavbarLogo.vue'
import NavbarLang from './NavbarLang.vue'
import NavbarProfile from './NavbarProfile.vue'
import NavbarTutorials from './NavbarTutorials.vue'

withDefaults(
  defineProps<{
    /**
     * Whether the navbar content should be centered (to keep consistent with the page content). Typically,
     * - We stretch the navbar content to full width for editor pages
     * - We center the navbar content for community pages
     */
    centered?: boolean
  }>(),
  {
    centered: false
  }
)
</script>

<style lang="scss" scoped>
@import '@/components/ui/responsive';

.top-nav {
  width: 100%;
  display: flex;
  justify-content: center;
  color: var(--ui-color-grey-100);
  background-color: var(--ui-color-primary-main);
  background-position: center;
  background-repeat: repeat;
  background-image: url(./bg.svg);
  box-shadow: var(--ui-box-shadow-diffusion);
}

.content {
  width: 100%;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 12px;
  height: 50px;

  &.centered {
    width: 1220px;
    @include responsive(desktop-large) {
      width: 1480px;
    }
  }

  @include responsive(mobile) {
    gap: 4px;
    padding: 0 4px;
    flex-wrap: nowrap; /* 防止换行 */
  }
}

.left,
.right {
  flex-basis: 30%;
  display: flex;
  min-width: 0; /* 允许flex项目收缩 */
}

.left {
  @include responsive(mobile) {
    flex: 0 0 auto; /* 固定大小，不收缩不扩展 */
    min-width: 60px; /* 确保最小宽度容纳logo */
    display: flex;
    align-items: center;
    overflow: visible;
    position: relative;
  }
}

.left-content {
  display: flex;
  align-items: center;
  flex-shrink: 1; /* 允许其他内容收缩 */
  min-width: 0;
  
  @include responsive(mobile) {
    display: none; /* 移动端隐藏左侧额外内容，只保留Logo */
  }
}

.center {
  flex-basis: 40%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  @include responsive(mobile) {
    flex-basis: auto;
    flex-grow: 1;
    min-width: 0; /* 允许中心区域收缩 */
  }
}

.right {
  gap: 8px;
  justify-content: flex-end;
  
  @include responsive(mobile) {
    flex-shrink: 1; /* 允许右侧内容收缩 */
    min-width: 0;
  }
}
</style>
