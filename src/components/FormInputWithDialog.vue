<template>
  <div class="FormInputWithDialog">
    <el-input
      class="specialSelectWrap"
      :value="valText"
      :placeholder="placeholder" :disabled="disabled" v-bind="$attrs"
      readonly @focus="isShowDialog = true">
    </el-input>

    <el-dialog
      :visible.sync="isShowDialog" :width="isSingle ? '510px' : '760px'"
      :close-on-click-modal="false"
      :append-to-body="isInnerDialog">
      <FormPool
        v-if="!isSingle"
        class="mb10"
        :dataList="calcSelfValItemList" defaultTxt="没有选择"
        @poolDel="hanldePoolDel"/>
      <el-tree
        ref="tree"
        class="tree-box" :style="{maxHeight: isSingle ? '400px' : '350px'}"
        :data="treeData"
        node-key="id" :props="defaultProps"
        :expand-on-click-node="false" :default-expand-all="true"
        @node-click="handleSele">
        <div
          class="node-box" slot-scope="{node}">
          <button type="button" class="btn fs14" :class="getClass(node)">
            {{node.label}}
          </button>
        </div>
      </el-tree>

      <template slot="footer">
        <div class="textCenter mb10">
          <button type="button" class="btn-operate btn-style-main" @click="handleConfirm">确认</button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script type="text/ecmascript-6">
  import FormPool from '@/components/FormPool';

  export default {
    components: {FormPool},
    props: {
      // 支持.sync;此处的val仅指IdList，对应文本为valText
      val: {
        required: true
      },
      placeholder: {
        type: String
      },
      // 单选还是多选
      isSingle: {
        type: Boolean,
        default: true
      },
      // 初始化数据必备条件，该属性是动态响应的 {methods: 'post' || 'get', url: String, params: Object, callBack: Function}
      ajaxObj: {
        type: Object,
        required: true,
        validator: obj => {
          return Reflect.has(obj, 'url');
        }
      },
      // 指明树结构的对应key名，通常来说不需要修改
      defaultProps: {
        type: Object,
        default () {
          return {children: 'subList', label: 'name'};
        }
      },
      // 自定义node是否可选
      fnGetClickAble: {
        type: Function
      },
      // 当组件放置在某个el-dialog上时需要打开避免dialog层级错误
      isInnerDialog: {
        type: Boolean,
        default: false
      },
      disabled: {
        type: Boolean
      }
    },
    data () {
      return {
        treeData: [],
        selfVal: '', // 组件内的val注意与this.val区分！
        selfText: '', // 组件内已选id对应的文本
        valText: '', // val值id对应的文本

        isShowDialog: false
      };
    },
    computed: {
      // 兼容处理val值 保证类型为数组
      calcValList () {
        if (this.isSingle === true) {
          return [this.val];
        } else {
          if (this.val) {
            return this.val;
          } else {
            return [];
          }
        }
      },
      // 同上，但处理的是selfVal注意区分应用
      calcSelfValList () {
        if (this.isSingle === true) {
          return [this.selfVal];
        } else {
          if (this.selfVal) {
            return this.selfVal;
          } else {
            return [];
          }
        }
      },
      // 切割valText给FormPool用
      calcSelfValItemList () {
        let valTextList = this.selfText.split(', ');
        return (this.selfVal || []).map((val, index) => ({id: val, txt: valTextList[index]}));
      }
    },
    watch: {
      // 更新对应文本
      val: {
        immediate: true,
        handler () {
          this.treeData.length !== 0 && this.setValText(false); // 使用了immediate 所以要避免初始化时重复更新
        }
      },
      // 同上，但更新的是selfText
      selfVal: {
        immediate: true,
        handler () {
          this.treeData.length !== 0 && this.setValText(true); // 使用了immediate 所以要避免初始化时重复更新
        }
      },
      // 动态响应ajaxObj
      ajaxObj: {
        immediate: true, // created时启动
        deep: true,
        handler () {
          if (this.ajaxObj.fnCleanTreeData) {
            this.treeData = this.ajaxObj.fnCleanTreeData();

            return false;
          }

          if (!this.ajaxObj.url) return console.warn('请填写正确的ajaxObj参数！');

          this.$axios[this.ajaxObj.method || 'post'](this.ajaxObj.url, this.ajaxObj.params || {})
            .then(res => {
              let resData = res.data.data;

              if (this.ajaxObj.callBack) {
                this.treeData = this.ajaxObj.callBack(res);
              } else {
                this.treeData = [resData]; // 数组化
              }

              this.setValText(false); // 初始化一下val对应文本
            });
        }
      },
      isShowDialog (newVal) {
        if (newVal) this.selfVal = this.val;
      }
    },
    methods: {
      // 仅isSingle为false时的FormPool组件使用
      hanldePoolDel (tarData) {
        this.handleSele(tarData, this.$refs.tree.getNode(tarData.id));
      },
      handleConfirm () {
        this.isShowDialog = false;

        this.$emit('update:val', this.selfVal);
        this.$emit('update:valText', this.selfText);
      },
      handleSele (tarData, node) {
        if (!this.getClickAble(node)) return; // 不是有效可点击节点

        if (this.isSingle) {
          // 由于 node-key 的设置原data的id在node上变更为key
          this.selfVal = this.selfVal === node.key ? '' : node.key;
        } else {
          let flatNodeList = this.flat(node); // 数据扁平化
          let newValList = this.deepCopy(this.calcSelfValList);

          if (flatNodeList.length === 1) { // 无children
            let index = newValList.findIndex(val => val === flatNodeList[0].key);
            if (index === -1) {
              newValList.push(flatNodeList[0].key);
            } else {
              newValList.splice(index, 1);
            }
          } else { // 有children children增删行为与父节点一致
            let index = newValList.findIndex(val => val === flatNodeList[0].key);
            let addFlag = index === -1; // 为true时 children部分全部新增，否则全部去除
            flatNodeList.forEach(item => {
              let index = newValList.findIndex(val => val === item.key);
              // 注意不要重复添加与多余删除
              if (addFlag && index === -1) {
                newValList.push(item.key);
              } else if (!addFlag && index !== -1) {
                newValList.splice(index, 1);
              }
            });
          }

          this.selfVal = newValList;
        }
      },
      // 数据扁平化 根据type决定不同的子元素key值
      flat (tarData, type = 'node') {
        let key = type === 'node' ? 'childNodes' : this.defaultProps.children;
        if (!tarData[key] || !tarData[key].length) return [tarData];

        let that = this;
        let childList = tarData[key].reduce((list, child) => [...list, ...that.flat(child, type)], []);
        let res = [tarData, ...childList];
        return res;
      },
      setValText (isSetSelf) {
        if (typeof isSetSelf !== 'boolean') throw new Error('参数isSetSelf必须是布尔值！');

        let rawFlatData = this.flat(this.deepCopy({[this.defaultProps.children]: this.treeData}), 'rawData');
        let tarValList = isSetSelf ? this.calcSelfValList : this.calcValList;
        let valTextList = tarValList.reduce((sumStr, key) => {
          let find = rawFlatData.find(item => item.id === key);
          if (find) {
            sumStr.push(find[this.defaultProps.label]);
          }
          return sumStr;
        }, []);

        if (isSetSelf) {
          this.selfText = valTextList.join(', ');
        } else {
          this.valText = valTextList.join(', ');
        }
      },
      getClickAble (node) {
        if (!node) throw new Error('参数node必填！');

        if (this.fnGetClickAble) {
          return this.fnGetClickAble(node);
        } else {
          let res = this.ajaxObj.params && Object.entries(this.ajaxObj.params).every(item => {
            let [keyName, val] = item;

            return val === node.data[keyName];
          });

          return res;
        }
      },
      getClass (node) {
        return {
          active: this.calcSelfValList.includes(node.key),
          clickAble: this.getClickAble(node)
        };
      }
    }
  };
</script>

<style scoped rel="stylesheet/scss" type="text/scss" lang="scss">
  @import '~@/assets/css/public.scss';

  .FormInputWithDialog {
    width: 100%;
  }

  .tree-box {
    overflow-y: auto;
  }

  /deep/ .el-tree-node__content {
    margin-bottom: 5px;
  }

  /deep/ .el-tree-node__expand-icon {
    color: #{$c-main};
  }

  .node-box {
    .btn {
      height: 24px;
      padding: 0 5px;
      border: 1px solid #ccc;
      border-radius: 5px;
      background-color: transparent;
      line-height: 24px;
      text-align: center;
      color: #{$c-333};
      &.clickAble.active, &.clickAble:hover {
        border: none;
        background-color: #{$c-main};
        color: #fff;
      }
    }
  }

  .specialSelectWrap {
    width: 100%;
    /deep/ .el-input__inner {
      width: 100%;
    }
  }
</style>
