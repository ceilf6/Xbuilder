<!-- Video list as a section -->

<template>
  <section :class="`context-${context}`" :style="{ '--video-num-in-row': numInRow }">
    <header class="header">
      <h2 class="title">
        <slot name="title"></slot>
      </h2>
      <RouterUILink
        v-if="linkTo != null"
        class="link"
        :to="linkTo"
      >
        <slot name="link"></slot>
        <UIIcon class="link-icon" type="arrowRightSmall" />
      </RouterUILink>
    </header>
    <div class="records-wrapper">
      <ListResultWrapper :query-ret="queryRet" :height="254">
        <template v-if="!!slots.empty" #empty="emptyProps">
          <slot name="empty" v-bind="emptyProps"></slot>
        </template>
        <ul class="records">
          <slot></slot>
        </ul>
      </ListResultWrapper>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useSlots } from 'vue'
import type { QueryRet } from '@/utils/query'
import { UIIcon } from '@/components/ui'
import ListResultWrapper from '../common/ListResultWrapper.vue'
import RouterUILink from '../common/RouterUILink.vue'

type Context = 'home' | 'user'

withDefaults(
  defineProps<{
    context?: Context
    numInRow?: number
    queryRet: QueryRet<any>
    linkTo?: string | null
  }>(),
  {
    context: 'home',
    numInRow: 4,
    linkTo: null
  }
)

const slots = useSlots()
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .title {
    margin: 0;
    color: var(--ui-color-title);
    font-size: 18px;
    line-height: 1.5;
    font-weight: 500;
  }

  .link {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--ui-color-primary-main);
    text-decoration: none;
    font-size: 14px;
    line-height: 1.5;

    .link-icon {
      width: 16px;
      height: 16px;
    }

    &:hover {
      color: var(--ui-color-primary-600);
    }
  }
}

.records-wrapper {
  margin-top: 12px;
}

.records {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(var(--video-num-in-row), 1fr);
  gap: 20px;
}

.context-home {
  .records {
    align-content: flex-start;
  }
}

.context-user {
  .records {
    align-content: flex-start;
  }
}
</style>
