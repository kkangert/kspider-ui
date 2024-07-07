<template>
	<div style="height: calc(100vh - 120px)">
		<fs-crud ref="crudRef" v-bind="crudBinding"> </fs-crud>
	</div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import createCrudOptions from './config';
import { useFs } from '@fast-crud/fast-crud';

const customProps = {
	appId: -1,

	// ---APP模型的绑定相关---
	binModelDialogShow: false,
	data: [],
	modelValue: [],
	// ---APP模型的绑定相关---

	// ---APP模型的回调绑定相关---
	binCallbackUrlDialogShow: false,
	// 绑定信息列表
	bindInfoList: [],
	// 回调地址信息
	callbackUrlList: {},
	// ---APP模型的回调绑定相关---
};

// crud初始化
const { crudRef, crudBinding, crudExpose, resetCrudOptions, appendCrudBinding } = useFs({ createCrudOptions });

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
