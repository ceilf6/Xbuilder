<script setup lang="ts">
const props = withDefaults(defineProps<{
  value: string
  active?: boolean

}>(), {
  value: '',
  active: false
})
function toKeyAndCode(v: string) {
  const special: Record<string, { key: string; code: string }> = {
    ' ': { key: ' ', code: 'Space' },
    '<': { key: 'ArrowLeft', code: 'ArrowLeft' },
    'v': { key: 'ArrowDown', code: 'ArrowDown' },
    '^': { key: 'ArrowUp', code: 'ArrowUp' },
    '>': { key: 'ArrowRight', code: 'ArrowRight' },
    // ArrowUp: { key: 'ArrowUp', code: 'ArrowUp' },
    // ArrowDown: { key: 'ArrowDown', code: 'ArrowDown' },
    // ArrowLeft: { key: 'ArrowLeft', code: 'ArrowLeft' },
    // ArrowRight: { key: 'ArrowRight', code: 'ArrowRight' }
  }
  if (special[v] != null) return special[v]

  if (/^[A-Za-z]$/.test(v)) {
    const u = v.toUpperCase()
    return { key: u.toLowerCase(), code: `Key${u}` }
  }
  if (/^[0-9]$/.test(v)) {
    return { key: v, code: `Digit${v}` }
  }
  return { key: v, code: v }
}

function getTargetWindow(): Window {
  const iframe = document.querySelector('.full-screen-project-runner iframe') as HTMLIFrameElement | null
  return (iframe?.contentWindow as Window | null) ?? window
}

function dispatchKey(type: 'keydown' | 'keyup', v: string) {
  const { key, code } = toKeyAndCode(v)
  const win = getTargetWindow()
  const doc = win.document
  const canvas = doc.querySelector('#game-canvas') as HTMLElement | null
  const event = new KeyboardEvent(type, { key, code, bubbles: true })
  if (canvas) {
    canvas.focus()
    canvas.dispatchEvent(event)
  } else {
    win.focus()
    doc.dispatchEvent(event)
  }
}
// function dispatchKey(type: 'keydown' | 'keyup', v: string) {
//   const { key, code } = toKeyAndCode(v)
//   const event = new KeyboardEvent(type, { key, code, bubbles: true })
//   dispatchEvent(event)
// }
let isPressed = false
function press(down: boolean) {

  if (down && !isPressed) {
    isPressed = true
    dispatchKey('keydown', props.value)
  } else if (!down && isPressed) {
    isPressed = false
    dispatchKey('keyup', props.value)
  }
}

</script>

<template>

  <div v-if="!props.active" class="ui-key-btn">{{ props.value }}</div>
  <div v-else class="ui-key-btn" @pointerdown.prevent.stop="press(true)" @pointerup.prevent.stop="press(false)"
    @pointercancel.prevent.stop="press(false)" @pointerleave.prevent.stop="press(false)">
    {{ props.value }}
  </div>
</template>


<style lang="scss" scoped>
.ui-key-btn {
  width: 50px;
  height: 50px;
  background-color: #b6b4b4;
  user-select: none;
  border-radius: 100px;
  text-align: center;
  line-height: 50px;
  color: #fff;
  opacity: 0.6;


}
</style>
