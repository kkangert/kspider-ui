<template>
	<div class="pt15 pr15 pb15 pl15">
		<el-form :model="state.line" size="default" label-width="50px" label-position="top">
			<el-form-item label="来往">
				<el-input v-model="state.line.contact" placeholder="来往" clearable disabled></el-input>
			</el-form-item>
			<el-form-item label="类型">
				<el-input v-model="state.line.type" placeholder="类型" clearable disabled></el-input>
			</el-form-item>
			<el-form-item label="名称">
				<el-input v-model="state.line.label" placeholder="请输入名称" clearable></el-input>
			</el-form-item>
			<el-form-item label="流转特性">
				<el-select v-model="state.line.exceptionFlow" placeholder="请选择">
					<el-option
						v-for="item in [
							{ label: '直接流转', value: 0 },
							{ label: '当出现异常流转', value: 1 },
							{ label: '未出现异常流转', value: 2 },
						]"
						:key="item.value"
						:label="item.label"
						:value="item.value"
					>
					</el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="流转条件(可写表达式)">
				<el-input v-model="state.line.condition" type="textarea" placeholder="类型" clearable></el-input>
			</el-form-item>
			<el-form-item label="是否传递变量">
				<el-switch v-model="state.line.transmitVariable" size="large" active-text="是" inactive-text="否" />
			</el-form-item>
			<el-form-item>
				<el-button @click="onLineTextChange" type="primary" :loading="state.loading">
					<SvgIcon name="ele-Check" />
					缓存
				</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts" name="pagesWorkflowDrawerLine">
import { reactive } from 'vue';
import { deepClone } from '/@/utils/other';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['change']);

// 定义变量内容
const state = reactive<EmptyObjectType>({
	line: {},
	loading: false,
});

// 获取父组件数据
const getParentData = (data: object) => {
	state.line = data;
};

// 保存
const onLineTextChange = () => {
	state.loading = true;
	emit('change', deepClone(state.line));
	let timer = setTimeout(() => {
		state.loading = false;
		clearTimeout(timer);
	}, 150);
};

// 暴露变量
defineExpose({
	getParentData,
});
</script>
