<template>
  <el-select
    class="FormSelectRemote"
    :value="calcVal"
    v-bind="$attrs"
    :clearable="$attrs.clearable !== false"
    @change="emitChange($event)">
    <el-option v-if="hasAllOpt" label="全部" :value="undefined"></el-option>
    <el-option
      v-for="(item, index) in optList" :key="index"
      :label="item.text" :value="item.value">
    </el-option>
  </el-select>
</template>

<script type="text/ecmascript-6">
  export default {
    props: {
      value: {
        required: true
      },
      remoteKey: {
        type: String,
        required: true
      },
      // 若为true则会填充一个文本为'全部'的可选项
      hasAllOpt: {
        type: Boolean
      }
    },
    data () {
      return {
        optList: []
      };
    },
    computed: {
      calcVal () {
        // 兼容业务类型与数据库类型
        if (this.value === undefined || this.value === null) return undefined;

        if (!this.optList[0]) {
          return this.value;
        } else {
          // 兼容多选
          if (this.value instanceof Array) {
            return this.value.map(item => {
              return this.optList[0].valueType === 'Integer' ? Number(item) : String(item);
            });
          }

          // 兼容clearable
          if (this.value === '') {
            return '';
          }
          return this.optList[0].valueType === 'Integer' ? Number(this.value) : String(this.value);
        }
      }
    },
    created () {
      this.getRemoteOptList();
    },
    methods: {
      async getRemoteOptList () {
        this.optList = await this.$store.dispatch('specialParams/getParam', {vue: this, key: this.remoteKey});
      },
      emitChange (newVal) {
        // change事件
        // @arg newVal
        this.$emit('change', newVal);
      }
    }
  };
</script>

<style scoped rel="stylesheet/scss" type="text/scss" lang="scss">
  .FormSelectRemote {
  }
</style>
