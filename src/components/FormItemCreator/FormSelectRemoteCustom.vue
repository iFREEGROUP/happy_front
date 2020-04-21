<template>
  <el-select
    class="FormSelectRemoteCustom"
    :value="value"
    v-bind="$attrs"
    :clearable="$attrs.clearable !== false"
    @change="emitChange($event)">
    <el-option
      v-for="(item, index) in optList" :key="index"
      :label="item.label" :value="item.value">
    </el-option>
  </el-select>
</template>

<script type="text/ecmascript-6">
  export default {
    props: {
      value: {
        required: true
      },
      remoteCustomFn: {
        type: Function,
        required: true
      }
    },
    data () {
      return {
        optList: []
      };
    },
    created () {
      this.remoteCustomFn(this.optList); //  optList应该在内部被改变，数据结构如[{label: xxx, value: xxx}]
    },
    methods: {
      emitChange (newVal) {
        // change事件
        // @arg newVal
        this.$emit('change', newVal);
      }
    }
  };
</script>

<style scoped rel="stylesheet/scss" type="text/scss" lang="scss">
  .FormSelectRemoteCustom {
  }
</style>
