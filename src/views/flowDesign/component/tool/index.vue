<template>
	<div class="workflow-tool">
		<div class="pl15">{{ setToolTitle }}</div>
		<div class="workflow-tool-right">
			<div class="workflow-tool-icon" v-for="(v, k) in state.toolList" :key="k" :title="v.title" @click="onToolClick(v.fnName)">
				<SvgIcon :name="v.icon" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts" name="pagesWorkflowTool">
import { computed, reactive } from 'vue';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['tool']);

// 定义变量内容
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);
const state = reactive({
	toolList: [
		{ icon: 'ele-Help', title: '帮助', fnName: 'help' },
		{ icon: 'ele-Download', title: '下载流程', fnName: 'download' },
		{ icon: 'ele-Odometer', title: '测试流程', fnName: 'test' },
		{ icon: 'ele-Aim', title: '开启调试', fnName: 'debug' },
		{ icon: 'ele-Bottom', title: '单步调试', fnName: 'resume' },
		{ icon: 'ele-Close', title: '停止调试', fnName: 'stopDebug' },
		{ icon: 'ele-Check', title: '提交流程', fnName: 'submit' },
		{ icon: 'ele-DocumentCopy', title: '复制流程', fnName: 'copy' },
		{ icon: 'ele-Delete', title: '清空流程', fnName: 'del' },
		{ icon: 'ele-FullScreen', title: '全屏', fnName: 'fullscreen' },
	],
});

// 设置 tool 标题
const setToolTitle = computed(() => {
	let { globalTitle } = themeConfig.value;
	return `${globalTitle}爬虫流程设计器`;
});
// 顶部工具栏
const onToolClick = (fnName: string) => {
	emit('tool', fnName);
};
</script>

<style scoped lang="scss">
.workflow-tool {
	height: 35px;
	display: flex;
	align-items: center;
	border-bottom: 1px solid var(--el-border-color-light, #ebeef5);
	color: var(--el-text-color-primary);
	.workflow-tool-right {
		flex: 1;
		display: flex;
		justify-content: flex-end;
	}
	&-icon {
		padding: 0 10px;
		cursor: pointer;
		color: var(--next-bg-topBarColor);
		height: 35px;
		line-height: 35px;
		display: flex;
		align-items: center;
		&:hover {
			background: rgba(0, 0, 0, 0.04);
			i {
				display: inline-block;
				animation: logoAnimation 0.3s ease-in-out;
			}
		}
	}
}
</style>
