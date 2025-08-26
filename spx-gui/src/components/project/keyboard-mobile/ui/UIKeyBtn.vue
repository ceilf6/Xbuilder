<script setup lang="ts">
const props =withDefaults(defineProps<{
  value:string

}>(),{
  value:''
})

</script>

<template>
  <div>
    <div class="ui-key-btn">{{ props.value }}</div>
  </div>
</template>


<style lang="scss" scoped>
.ui-key-btn{
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

