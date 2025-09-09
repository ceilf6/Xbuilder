<template>
  <router-link v-radar="{ name: 'Logo link', desc: 'Logo image as link to the homepage' }" class="logo" to="/">
    <img :src="logoSvg" />
  </router-link>
</template>

<script setup lang="ts">
import logoSvg from './logo.svg'
</script>

<style lang="scss" scoped>
@import '@/components/ui/responsive';

.logo {
  position: relative;
  height: 100%;
  margin: 0 24px 0 24px;
  display: flex;
  align-items: center;
  flex-shrink: 0; /* 防止logo被压缩 */
  z-index: 10; /* 确保logo在最上层 */

  &::after {
    content: '';
    position: absolute;
    right: -24px;
    display: block;
    width: 1px;
    height: 24px;
    background: rgba(255, 255, 255, 0.3);
  }

  @include responsive(mobile) {
    margin: 0 4px 0 4px;
    flex-shrink: 0 !important; /* 强制不收缩 */
    min-width: 40px; /* 确保最小宽度 */
    position: relative;
    z-index: 100; /* 确保在最上层 */
    
    &::after {
      right: -4px;
    }
  }

  img {
    height: 32px;
    width: auto;
    display: block; /* 确保图片正确显示 */
    
    @include responsive(mobile) {
      height: 24px;
      min-width: 24px; /* 确保最小宽度 */
    }
  }
}
</style>
