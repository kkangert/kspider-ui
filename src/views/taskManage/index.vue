<template>
	<div style="height: calc(100vh - 120px)">
		<fs-crud ref="crudRef" v-bind="crudBinding">
			<template #cell_jobEnabled="scope">
				<el-switch v-model="scope.row.jobEnabled" />
			</template>
			<template #cell_cron="scope">
				<el-link @click="openCronDialog(scope.row)" type="primary">{{ scope.row.cron == null || '' ? '添加表达式' : scope.row.cron }}</el-link>
			</template>
		</fs-crud>

		<!-- 表达式生成 -->
		<el-dialog v-model="crudBinding['customProps']['cronDialogVisible']" title="调度表达式生成" width="800">
			<Crontab :expression="crudBinding['customProps']['cronExpression']" @hide="cronDialogHide" @fill="cronFill" />
		</el-dialog>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, defineAsyncComponent, ref } from 'vue';
import createCrudOptions from './config';
import { useFs } from '@fast-crud/fast-crud';
const Crontab = defineAsyncComponent(() => import('/@/components/Crontab/index.vue'));

/**
 * 自定义属性
 */
const customProps = {
	cronDialogVisible: false,
	cronExpression: '* * * * * ?',
};

const originalRow = ref();

/**
 * 隐藏窗口
 */
const cronDialogHide = () => {
	crudBinding.value['customProps']['cronDialogVisible'] = false;
};

/**
 * 打开表达式生成器窗口
 * @param ctx
 */
const openCronDialog = (ctx: any) => {
	originalRow.value = ctx;
	crudBinding.value['customProps']['cronExpression'] = ctx.cron;
	crudBinding.value['customProps']['cronDialogVisible'] = true;
};
/**
 * 表达式填充
 * @param value 生成的cron表达式
 */
const cronFill = (value: string) => {
	originalRow.value.cron = value;
};

// crud初始化
const { crudRef, crudBinding, crudExpose, resetCrudOptions, appendCrudBinding, context } = useFs({ createCrudOptions });

// 添加扩展属性
appendCrudBinding({ customProps });

// 你可以调用此方法，重新初始化crud配置
// resetCrudOptions(options)
// 页面打开后获取列表数据

onMounted(() => {
	crudExpose.doRefresh();
});
</script>

<style scoped lang="scss"></style>
