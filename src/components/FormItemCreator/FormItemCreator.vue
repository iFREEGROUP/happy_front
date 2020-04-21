<!--使用该组件必须保证外层组件含有el-form-->
<template>
  <FormWithLabel
    class="FormItemCreator" :style="{width: calcWrapWidth}"
    :label="label" v-bind="$attrs">
    <slot>
      <el-input
        v-if="['input', 'inputNum'].includes(formType)"
        :type="formType === 'inputNum' ? 'number': 'text'"
        :value="val" :placeholder="placeholder || label" v-bind="formAttrs"
        @change="$emit('update:val', $event)">
      </el-input>

      <el-select
        v-else-if="formType === 'select'"
        :value="val" :placeholder="placeholder || '请选择'" v-bind="formAttrs"
        :clearable="formAttrs.clearable !== false"
        @change="$emit('update:val', $event)">
        <el-option v-if="hasAllOpt" label="全部" :value="undefined"></el-option>
        <el-option
          v-for="(item, index) in optList" :key="index"
          :label="item.label" :value="item.val">
        </el-option>
      </el-select>

      <!--统一调用crmMap/selectByName接口作为optlist的select-->
      <FormSelectRemote
        v-else-if="formType === 'selectRemote'"
        :hasAllOpt="hasAllOpt"
        :value="val" :placeholder="placeholder || '请选择'" :remoteKey="remoteKey" v-bind="formAttrs"
        @change="$emit('update:val', $event)"/>

      <!--完全自定义optlist-->
      <FormSelectRemoteCustom
        v-else-if="formType === 'selectRemoteCustom'"
        :value="val" :placeholder="placeholder || '请选择'" :remoteCustomFn="remoteCustomFn" v-bind="formAttrs"
        @change="$emit('update:val', $event)"/>

      <!--统一调用org/search接口并提供树形结构选择的表单-->
      <FormInputWithDialog
        v-else-if="formType === 'specialSelect'"
        :val="val"
        :placeholder="placeholder || label" :ajaxObj="ajaxObj" :isInnerDialog="isInnerDialog"
        v-bind="formAttrs"
        @update:val="$emit('update:val', $event)"
        @update:valText="$emit('update:valText', $event)"/>

      <!--slotWidth应该为'auto'-->
      <el-checkbox-group
        v-else-if="formType === 'checkbox'"
        class="ml20"
        :value="val" @input="$emit('update:val', $event)">
        <el-checkbox
          v-for="(item, index) in checkList" :key="index" :label="item.val">
          {{item.txt}}
        </el-checkbox>
      </el-checkbox-group>

      <el-date-picker
        v-else-if="formType === 'date' && dateType !== 'daterange'"
        :value="val" :type="dateType"
        :value-format="dateValueFormat"
        :placeholder="placeholder || '日期'"
        range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
        v-bind="formAttrs"
        @input="$emit('update:val', $event)"/>

      <template v-else-if="formType === 'date' && dateType === 'daterange'">
        <el-date-picker
          :value="val && val[0]"
          :value-format="dateValueFormat"
          :placeholder="placeholder || '开始日期'"
          v-bind="formAttrs"
          @input="handleDaterangeInput('start', $event)"/>
        <span class="ml10 mr10">至</span>
        <el-date-picker
          :value="val && val[1]"
          :value-format="dateValueFormat"
          :placeholder="placeholder || '结束日期'"
          v-bind="formAttrs"
          @input="handleDaterangeInput('end', $event)"/>
      </template>

      <el-time-picker
        v-else-if="formType === 'timePicker'"
        :value="val"
        v-bind="formAttrs"
        :value-format="dateValueFormat" size="small"
        @input="$emit('update:val', $event)"/>
    </slot>

    <template slot="after">
      <slot name="after">
        <span v-if="formType === 'date' && dateType === 'dateRangeStart'" class="ml10">至</span>
      </slot>
    </template>
  </FormWithLabel>
</template>

<script type="text/ecmascript-6">
  import FormSelectRemote from '@/components/FormSelectRemote';
  import FormInputWithDialog from '@/components/FormInputWithDialog';
  import FormSelectRemoteCustom from '@/components/FormSelectRemoteCustom';

  export default {
    components: {FormSelectRemote, FormInputWithDialog, FormSelectRemoteCustom},
    props: {
      wrapWidth: {
        type: [String, Number],
        default: 'auto'
      },
      label: {
        type: String,
        default: ''
      },
      formType: {
        type: String,
        required: true,
        validator: val => ['input', 'inputNum', 'select', 'selectRemote', 'specialSelect', 'selectRemoteCustom', 'checkbox', 'date', 'timePicker'].includes(val)
      },
      // 支持.sync
      val: {
        required: true
      },
      placeholder: {
        type: String,
        default: ''
      },
      // 若为true则会为select、selectRemote填充一个文本为'全部'的可选项
      hasAllOpt: {
        type: Boolean
      },
      // 给内部表单元素使用的attrs属性
      formAttrs: {
        type: Object,
        default: () => ({})
      },
      // formType === 'inputNum' 时 使用，修正值的位数
      numToFix: {
        type: Number,
        default: 0
      },
      // formType === 'date' 时 使用，除了支持el-date-picker本身支持的type外还支持
      dateType: {
        type: String
      },
      // formType === 'date' 'timePicker' 时 使用的时间结果格式
      dateValueFormat: {
        type: String,
        default: 'timestamp'
      },
      // formType === 'select' 时 使用的option选项表
      optList: {
        type: Array,
        default: () => [{label: '', val: ''}]
      },
      // formType === 'selectRemote' 时 使用的option选项表查询key
      remoteKey: {
        type: String,
        default: ''
      },
      // formType === 'selectRemoteCustom' 时 使用remoteCustomFn的返回值生成optList
      remoteCustomFn: {
        type: Function
      },
      // formType === 'specialSelect' 时 使用的option选项表查询必备相关参数
      ajaxObj: {
        type: Object,
        validator: obj => {
          return Reflect.has(obj, 'url');
        }
      },
      // formType === 'specialSelect' 时 表明组件是否放置在el-dialog内，以避免层级错误
      isInnerDialog: {
        type: Boolean
      },
      // formType === 'checkbox' 时 使用的option选项表
      checkList: {
        type: Array,
        default: () => [{val: '', txt: ''}]
      },
      // formType === 'date' && dateType === 'daterange' 时 决定结束时间是否要补23小时59分59秒
      changeEndTime: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      // 无法计算带槽的情况，请自己补充宽度
      calcWrapWidth () {
        if (typeof this.wrapWidth === 'string') {
          if (this.wrapWidth.match('fix')) { // 强制自定义
            return this.wrapWidth.replace('fix', '');
          } else if (this.wrapWidth.match('%')) {
            return this.wrapWidth;
          } else if (this.wrapWidth === 'auto') {
            return this.getRoundWidth();
          } else if (this.wrapWidth.match('px')) {
            return this.getRoundWidth();
          } else {
            return this.wrapWidth;
          }
        } else {
          return this.getRoundWidth();
        }
      }
    },
    watch: {
      val: {
        immediate: true,
        handler (newVal) {
          if (this.formType === 'inputNum' && this.numToFix && newVal !== undefined && newVal !== null && !String(newVal).match(/\.\d{2}/)) {
            this.$emit('update:val', Number(newVal).toFixed(this.numToFix));
          }
        }
      }
    },
    methods: {
      getRoundWidth () {
        const BASE_UNIT = 350;
        if (this.wrapWidth === 'auto' && this.formType === 'date' && this.dateType === 'daterange') { // 范围日期组件默认1.5单位
          return 1.5 * BASE_UNIT + 'px';
        } else if (this.wrapWidth === 'auto') { // 以label、表单合计宽度计算
          let labelWidth = typeof this.$attrs.labelWidth === 'number'
            ? this.$attrs.labelWidth
            : this.$attrs.labelWidth && this.$attrs.labelWidth.match(/\d+/) !== null && Number(this.$attrs.labelWidth.match(/\d+/)[0]);
          if (!labelWidth) {
            let length = this.label.replace(/[\u0391-\uFFE5]/g, '**').length;

            if (length === 0) { // 无内容
              labelWidth = 0;
            } else if (length <= 8) { // 1-4字
              labelWidth = 90;
            } else if (length <= 12) { // 5-6字
              labelWidth = 100;
            } else if (length <= 16) { // 7-8字
              labelWidth = 120;
            } else {
              labelWidth = 140;
            }
          }
          let slotWidth = typeof this.$attrs.slotWidth === 'number'
            ? this.$attrs.slotWidth
            : (this.$attrs.slotWidth && this.$attrs.slotWidth.match(/\d+/) !== null && Number(this.$attrs.slotWidth.match(/\d+/)[0])) || 200;

          let unitCount = Math.ceil((labelWidth + slotWidth) / BASE_UNIT);
          return unitCount * BASE_UNIT + (unitCount - 1) * 10 + 'px'; // 多单位时n-1个10px
        } else { // 以wrapWidth宽度计算
          let num = typeof this.wrapWidth === 'number' ? this.wrapWidth : Number(this.wrapWidth.match(/\d+/)[0]);
          let unitCount = Math.ceil(num / BASE_UNIT);
          return unitCount * BASE_UNIT + (unitCount - 1) * 10 + 'px';
        }
      },
      handleDaterangeInput (type, newVal) {
        if (type === 'start') {
          if (!this.val || !this.val[1] || newVal <= this.val[1]) {
            this.$emit('update:val', [newVal, (this.val && this.val[1]) || undefined]);
          } else {
            this.$emit('update:val', [undefined, (this.val && this.val[1]) || undefined]);
            this.$message.error('开始日期不能大于结束日期！');
          }
        } else if (type === 'end') {
          if (!this.val || !this.val[0] || (this.val && newVal >= this.val[0])) {
            if (this.changeEndTime && newVal) {
              newVal = newVal + (60 * 60 * 24 - 1) * 1e3; // 补23小时59分59秒
            }

            this.$emit('update:val', [(this.val && this.val[0]) || undefined, newVal]);
          } else {
            this.$emit('update:val', [(this.val && this.val[0]) || undefined, undefined]);
            this.$message.error('结束日期不能小于开始日期！');
          }
        } else {
          throw new Error('参数type值错误！');
        }
      }
    }
  };
</script>

<style scoped rel="stylesheet/scss" type="text/scss" lang="scss">
  .FormItemCreator {
  }
</style>
