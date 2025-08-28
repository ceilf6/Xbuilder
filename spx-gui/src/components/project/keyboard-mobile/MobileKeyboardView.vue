<script setup lang="ts">
import UIKeyBtn from './ui/UIKeyBtn.vue';
import { onMounted, reactive } from 'vue';
const zones = ['lt', 'rt', 'lbUp', 'lbLeft', 'lbRight', 'lbDown', 'rbA', 'rbB', 'rbX', 'rbY']
type ZoneId = typeof zones[number]
const zoneToKey = reactive<Record<ZoneId, string | null>>({
    lt: null, rt: null, lbUp: null, lbLeft: null, lbRight: null, lbDown: null, rbA: null, rbB: null, rbX: null, rbY: null
})
type BackendPayload = Partial<Record<ZoneId, string | null>>
// onMounted(() => {
//     const payload: BackendPayload = {
//         lt: 'Q',
//         rt: 'E',
//         lbUp: '^',
//         lbLeft: '<',
//         lbRight: '>',
//         lbDown: 'v',
//         rbA: 'J',
//         rbB: 'K',
//         rbX: 'U',
//         rbY: 'I'
//     }
//     Object.assign(zoneToKey, payload)

// })
const props = defineProps<{ initial?: BackendPayload | null }>()
onMounted(() => {
    Object.assign(zoneToKey, props.initial)
})
</script>

<template>
    <div class="phone-1YZxt">
        <slot name="gameView" class="game-view"></slot>
        <div class="stage-vTZqo">
            <!-- 左上角-->
            <div class="zone lt">
                <UIKeyBtn v-if="zoneToKey.lt" :value="zoneToKey.lt!" :active="true" />
            </div>
            <!-- 右上角 -->
            <div class="zone rt">
                <UIKeyBtn v-if="zoneToKey.rt" :value="zoneToKey.rt!" :active="true" />
            </div>

            <!-- 左下角 4 -->
            <div class="zone lb-up">
                <UIKeyBtn v-if="zoneToKey.lbUp" :value="zoneToKey.lbUp!" :active="true" />
            </div>
            <div class="zone lb-left">
                <UIKeyBtn v-if="zoneToKey.lbLeft" :value="zoneToKey.lbLeft!" :active="true" />
            </div>
            <div class="zone lb-right">
                <UIKeyBtn v-if="zoneToKey.lbRight" :value="zoneToKey.lbRight!" :active="true" />
            </div>
            <div class="zone lb-down">
                <UIKeyBtn v-if="zoneToKey.lbDown" :value="zoneToKey.lbDown!" :active="true" />
            </div>

            <!-- 右下角 4 -->
            <div class="zone rb-a">
                <UIKeyBtn v-if="zoneToKey.rbA" :value="zoneToKey.rbA!" :active="true" />
            </div>
            <div class="zone rb-b">
                <UIKeyBtn v-if="zoneToKey.rbB" :value="zoneToKey.rbB!" :active="true" />
            </div>
            <div class="zone rb-x">
                <UIKeyBtn v-if="zoneToKey.rbX" :value="zoneToKey.rbX!" :active="true" />
            </div>
            <div class="zone rb-y">
                <UIKeyBtn v-if="zoneToKey.rbY" :value="zoneToKey.rbY!" :active="true" />
            </div>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.phone-1YZxt {
    position: relative;
    display: inline-block;
    width: 100%;
    height: 100%;
}

.game-view {
    display: block;
    max-width: 100%;
    height: auto;
}

.stage-vTZqo {
    // background-color: #413e3e;
    position: absolute;
    inset: 0;
    z-index: 2;

    .zone {
        position: absolute;
        display: grid;
        place-items: center;
        height: 23%;
        padding: 1%;
    }

    .lt {
        left: 6%;
        top: 8%;
    }

    .rt {
        right: 6%;
        top: 8%;
    }

    .lb-up {
        left: 10%;
        bottom: 40%;
    }

    .lb-left {
        left: 4%;
        bottom: 24%;
    }

    .lb-right {
        left: 16%;
        bottom: 24%;
    }

    .lb-down {
        left: 10%;
        bottom: 8%;
    }

    .rb-a {
        right: 15%;
        bottom: 35%;
    }

    .rb-b {
        right: 5%;
        bottom: 35%;
    }

    .rb-x {
        right: 15%;
        bottom: 10%;
    }

    .rb-y {
        right: 5%;
        bottom: 10%;
    }
}
</style>