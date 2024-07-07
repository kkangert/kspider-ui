<template>
	<div class="workflow-drawer-node">
		<div class="config-page">
			<div class="change-button" @click="tabChange">
				<div :class="{ active: state.currCard === '基本信息' }">基本信息</div>
				<div :class="{ active: state.currCard === '高级配置' }">高级配置</div>
			</div>
			<div class="config-item-card" v-if="state.currCard === '基本信息'">
				<el-scrollbar>
					<el-form
						:model="state.node"
						:rules="state.nodeRules"
						ref="nodeFormRef"
						size="default"
						label-width="80px"
						label-position="top"
						class="pt15 pr15 pb15 pl15"
					>
						<el-form-item label="节点ID" prop="nodeId">
							<el-input v-model="state.node.nodeId" placeholder="请输入节点ID" clearable disabled></el-input>
						</el-form-item>
						<el-form-item label="节点类型" prop="type">
							<el-input v-model="state.node.type" placeholder="请输入节点类型" clearable disabled></el-input>
						</el-form-item>
						<el-form-item label="节点名称" prop="label">
							<el-input v-model="state.node.label" placeholder="请输入节点名称" clearable></el-input>
						</el-form-item>
						<el-form-item>
							<el-button type="primary" class="mb15" @click="onNodeSubmit">
								<SvgIcon name="ele-Check" />
								缓存
							</el-button>
						</el-form-item>
					</el-form>
				</el-scrollbar>
			</div>
			<div class="config-item-card" v-if="state.currCard === '高级配置'">
				<el-scrollbar>
					<el-form :model="state.form" ref="extendFormRef" size="default" label-width="80px" label-position="top" class="pt15 pr15 pb15 pl15">
						<el-form-item
							:label="val.labelName"
							:prop="val.propName"
							v-for="(val, key) in state.node.form"
							:key="key"
							:rules="[{ required: val.required, message: `${val.labelName}不能为空`, trigger: 'blur' }]"
						>
							<div></div>
							<!-- 普通输入框 -->
							<el-input
								v-model="state.form[val.propName]"
								:placeholder="val.placeholder"
								clearable
								v-if="val.componentType === 'EL_INPUT'"
								:disabled="false"
							></el-input>

							<!-- 数字输入框 -->
							<el-input-number
								v-model="state.form[val.propName]"
								:placeholder="val.placeholder"
								controls-position="right"
								:formatter="(value:any) => Number(value)"
								:parser="(value:any) => Number(value)"
								v-if="val.componentType === 'EL_NUMBER_INPUT'"
								v-bind="val.attributes"
								:disabled="false"
							></el-input-number>

							<!-- 单选框(选项多) -->
							<el-select
								v-model="state.form[val.propName]"
								v-bind="val.attributes"
								:placeholder="val.placeholder"
								v-if="val.componentType === 'EL_SELECT'"
								clearable
								filterable
								:disabled="val.disabled"
							>
								<el-option v-for="item in val.childrenItem" :key="item.value" :label="item.labelName" :value="item.value"> </el-option>
							</el-select>

							<!-- 多选框(选项多) -->
							<el-select
								v-model="state.form[val.propName]"
								v-bind="val.attributes"
								multiple
								:placeholder="val.placeholder"
								v-if="val.componentType === 'EL_MULT_SELECT'"
								clearable
								filterable
								:disabled="val.disabled"
							>
								<el-option v-for="item in val.childrenItem" :key="item.value" :label="item.labelName" :value="item.value"> </el-option>
							</el-select>

							<!-- 开关组件(针对需要布尔值的) -->
							<el-switch
								v-if="val.componentType === 'EL_SWITCH'"
								v-model="state.form[val.propName]"
								size="large"
								active-text="是"
								inactive-text="否"
							/>

							<!-- 多键值录入组件 -->
							<MultKeyValue
								v-model="state.form[val.propName]"
								:ref-id="state.node.nodeId"
								v-if="val.componentType === 'CUSTOM_MULT_KEY_VALUE' || val.componentType === 'CUSTOM_MULT_VALUE'"
								:is-mult-key="val.componentType === 'CUSTOM_MULT_KEY_VALUE' ? true : false"
							></MultKeyValue>
						</el-form-item>
						<el-form-item>
							<el-button type="primary" class="mb15" @click="onExtendSubmit" :loading="state.loading.extend">
								<SvgIcon name="ele-Check" />
								缓存
							</el-button>
						</el-form-item>
					</el-form>
				</el-scrollbar>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts" name="pagesWorkflowDrawerNode">
import { reactive, ref, defineAsyncComponent, nextTick } from 'vue';
import { deepClone } from '/@/utils/other';

const MultKeyValue = defineAsyncComponent(() => import('../MultKeyValue.vue'));

// 定义子组件向父组件传值/事件
const emit = defineEmits(['submit']);

// 定义变量内容
var nodeFormRef = ref();
var extendFormRef = ref();

const state = reactive<WorkflowDrawerNodeState>({
	node: {},
	nodeRules: {
		nodeId: [{ required: true, message: '请输入节点Id', trigger: 'blur' }],
		type: [{ required: true, message: '请输入类型', trigger: 'blur' }],
		left: [{ required: true, message: '请输入left坐标', trigger: 'blur' }],
		top: [{ required: true, message: '请输入top坐标', trigger: 'blur' }],
		icon: [{ required: true, message: '请输入icon图标', trigger: 'blur' }],
		label: [{ required: true, message: '请输入节点名称', trigger: 'blur' }],
	},
	form: {},
	currCard: '基本信息',
	tabsActive: '1',
	loading: {
		extend: false,
	},
});

/**
 * tab页切换
 * @param e 冒泡事件
 */
const tabChange = (e: MouseEvent) => {
	let ele = e.target as HTMLDivElement;
	let tabName = ele.innerText as any;
	state.currCard = tabName;
	switch (tabName) {
		case '基本信息':
			break;
		case '高级配置':
			break;
		default:
			break;
	}
};

// 视图更新
nextTick(() => {
	// 表单数据回显
	if (state.node && state.node['form']) {
		for (const item of state.node.form) {
			state.form[item.propName] = item.value;
		}
		onNodeSubmit();
		onExtendSubmit();
	}
});

// 获取父组件数据
const getParentData = (data: any) => {
	state.currCard = '基本信息';

	// 初始化配置项表单
	state.node = data;

	// 表单数据回显
	for (const item of data.form) {
		state.form[item.propName] = item.value;
	}
};

// 节点编辑-保存
const onNodeSubmit = () => {
	nodeFormRef.value.validate((valid: boolean) => {
		if (valid) {
			// 保存表单数据
			let formData = state.node.form.map((item: any) => {
				item['value'] = state.form[item.propName];
				return item;
			});
			state.node.form = formData;
			emit('submit', deepClone(state.node));
		} else {
			return false;
		}
	});
};

// 扩展表单-保存
const onExtendSubmit = () => {
	extendFormRef.value.validate((valid: boolean) => {
		if (valid) {
			state.loading.extend = true;
			let timer = setTimeout(() => {
				// 保存表单数据
				let formData = state.node.form.map((item: any) => {
					item['value'] = state.form[item.propName];
					return item;
				});
				state.node.form = formData;

				// 提交数据
				emit('submit', deepClone(state.node));
				state.loading.extend = false;
				clearTimeout(timer);
			}, 500);
		} else {
			return false;
		}
	});
};

// 暴露变量
defineExpose({
	getParentData,
});
</script>

<style scoped lang="scss">
.workflow-drawer-node {
	width: 100%;
	height: 100%;

	// 右侧配置页
	.config-page {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;

		.change-button {
			flex: 1;
			height: 10%;
			width: 100%;
			display: flex;
			flex-direction: row;
			justify-content: center;
			align-items: center;
			border-bottom: 1px solid #eee;

			div {
				cursor: pointer;
				user-select: none;
				text-align: center;
				width: 100%;
				height: 100%;
				display: flex;
				justify-content: center;
				align-items: center;
				color: black;
				font-size: 10%;
			}

			.active {
				background-color: #ebf5ff;
				color: #409eff;
			}
		}

		.config-item-card {
			flex: 23;
			overflow: hidden;
		}
	}
}
</style>
