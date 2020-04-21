<template>
  <form class="FormPool" :style="calcStyle" @submit.prevent>
    <ul v-if="dataList.length > 0" class="data-list">
      <li
        v-for="(item, index) in dataList" :key="index"
        class="data-item">
        <button type="button" class="btn mb10 mr10" @click="handleDel(item)">
          {{item[txtKey]}}
          <i class="el-icon-circle-close"></i>
        </button>
      </li>
    </ul>
    <div v-else class="defaultTxt">{{defaultTxt}}</div>
  </form>
</template>

<script type="text/ecmascript-6">
  export default {
    props: {
      dataList: {
        type: Array,
        required: true
      },
      txtKey: {
        type: String,
        default: 'txt'
      },
      defaultTxt: {
        type: String,
        default: ''
      },
      height: {
        type: String,
        default: '100px'
      }
    },
    computed: {
      calcStyle () {
        return {height: this.height};
      }
    },
    methods: {
      handleDel (item) {
        // 删除事件
        // @arg item
        this.$emit('poolDel', item);
      }
    }
  };
</script>

<style scoped rel="stylesheet/scss" type="text/scss" lang="scss">
  @import '~@/assets/css/public.scss';

  .FormPool {
    position: relative;
    border: 2px dashed #{$c-eee};
    border-radius: 5px;
    background-color: #f9f9f9;
    overflow-y: auto;
  }

  .data-list {
    padding: 10px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }

  .data-item {
    .btn {
      &:hover {
        color: #fff;
      }
      @extend .label-radius;
      width: auto;
      color: #fff;
      padding: 0 5px;
      background-color: #{$c-main};
    }
  }

  .defaultTxt {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #aaa;
  }
</style>
