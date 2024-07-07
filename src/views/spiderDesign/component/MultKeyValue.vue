<template>
	<div class="multKeyValueContainer">
		<div class="left" @click="change('left')">&lt;</div>
		<div class="right" @click="change('right')">></div>
		<div class="input">
			<el-form :model="state.form" :inline="false" ref="multKeyValueExtendFormRef" size="default" label-width="50px" label-position="top">
				<el-form-item v-if="props.isMultKey" label="键" prop="key" key="key" :rules="[{ required: true, message: `键不能为空`, trigger: 'blur' }]">
					<el-input v-model="state.form.key" :placeholder="props.keyPlaceholder" clearable></el-input>
				</el-form-item>
				<el-form-item label="值" prop="value" key="value" :rules="[{ required: true, message: `值不能为空`, trigger: 'blur' }]">
					<el-input v-model="state.form.value" :placeholder="props.valuePlaceholder" clearable></el-input>
				</el-form-item>
				<el-form-item label="备注" prop="remark" key="remark">
					<el-input v-model="state.form.remark" placeholder="请输入备注信息" clearable></el-input>
				</el-form-item>
			</el-form>
		</div>
		<div class="tools">
			<div class="addItem" @click="addItem">+</div>
			<div v-if="props.modelValue.length > 0" class="deleteItem" @click="deleteItem">-</div>
			<div class="tips">
				<div v-if="props.modelValue.length > 0">共{{ props.modelValue.length }}条,当前第{{ state.currentIdx + 1 }}条</div>
				<div v-else>暂无数据,请添加</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { deepClone } from '/@/utils/other';

const multKeyValueExtendFormRef = ref();

interface StateType {
	// 当前下标
	currentIdx: number;
	// 表单数据
	form: Record<'key' | 'value' | 'remark', string>;
	// 模式标记
	currMode: 'viewOrEdit' | 'add';
}

const emit = defineEmits(['update:modelValue']);

const props = defineProps({
	// 是否支持多键
	isMultKey: {
		default: false,
	},
	keyPlaceholder: {
		default: '请输入定义的KEY',
	},
	valuePlaceholder: {
		default: '请输入定义的VALUE',
	},
	modelValue: {
		default: Array<any>,
		required: false,
	},
});

const state = reactive<StateType>({
	currentIdx: 0,
	form: {
		key: '',
		value: '',
		remark: '',
	},
	currMode: 'add',
});

/**
 * 切换数据
 */
const change = (direction: string, idx?: number) => {
	state.currMode = 'viewOrEdit';
	let dataLength = props.modelValue.length;

	if (idx) {
		state.currentIdx = idx;
	} else {
		if (dataLength > 1) {
			if (direction === 'left') {
				if (state.currentIdx - 1 >= 0) {
					state.currentIdx--;
				} else {
					state.currentIdx = dataLength - 1;
				}
			}

			if (direction === 'right') {
				if (state.currentIdx + 1 < dataLength) {
					state.currentIdx++;
				} else {
					state.currentIdx = 0;
				}
			}
		} else {
			state.currentIdx = dataLength - 1 >= 0 ? dataLength - 1 : 0;
		}
	}

	if (dataLength > 0) {
		state.form = props.modelValue[state.currentIdx];
	} else {
		clearForm();
	}
};

/**
 * 添加键值对item
 */
const addItem = () => {
	if (state.currMode === 'viewOrEdit') {
		props.modelValue.push({});
		change('left', props.modelValue.length - 1);
	} else {
		multKeyValueExtendFormRef.value.validate((valid: boolean) => {
			if (valid) {
				let key = 'key';
				if (!props.isMultKey) {
					key = 'value';
				}

				// 校验通过，添加至数据数组中
				let hasData = props.modelValue.filter((item) => item[key] == state.form[key]);

				// 判断是否已存在
				if (hasData.length <= 0) {
					const form = deepClone(state.form);
					// 不存在则添加
					props.modelValue.push(form);

					clearForm();
				}
			} else {
				return false;
			}
		});
	}
};

const clearForm = () => {
	// 清空表单
	for (const key in state.form) {
		if (Object.prototype.hasOwnProperty.call(state.form, key)) {
			state.form[key] = '';
		}
	}
};

/**
 * 删除键值对item
 */
const deleteItem = () => {
	if (props.modelValue.length > 0) {
		props.modelValue.splice(state.currentIdx, 1);
		setTimeout(() => change('left'), 120);
	}
};

watch(
	() => state.currentIdx,
	(currVal, oldVal) => {
		let dataLength = props.modelValue.length;
		if (currVal <= dataLength && currVal >= 0) {
			state.form = props.modelValue[currVal];
		} else {
			state.form = props.modelValue[dataLength - 1];
		}
	},
	{}
);

watch(
	() => props.modelValue,
	(currVal, oldVal) => {
		emit('update:modelValue', currVal);
	},
	{ deep: true }
);

onMounted(() => {
	if (props.modelValue.length > 0) {
		state.currMode = 'viewOrEdit';
		state.currentIdx = props.modelValue.length - 1;
	} else {
		state.currMode = 'add';
	}
});
</script>

<style lang="scss" scoped>
.multKeyValueContainer {
	display: flex;
	flex-direction: column;
	justify-content: center;
	border-radius: 5px;
	color: var(--el-text-color-secondary);
	padding: 5px;
	position: relative;
	overflow: hidden;
	border: 1px solid #cac9c9;
	width: 100%;

	// 修复校验提示被遮挡问题
	:deep(.el-form-item.el-form-item) {
		margin-bottom: 18px;
	}

	.input {
		margin: 5px;
	}

	.left,
	.right {
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
		color: transparent;
		user-select: none;

		&:hover {
			color: white;
			z-index: 999;
			background-color: #cac9c9;
			cursor: pointer;
		}
	}

	.left {
		left: 0;
		height: 100%;
		width: 22px;
	}

	.right {
		right: 0;
		height: 100%;
		width: 22px;
	}

	.tools {
		display: flex;
		justify-content: space-around;
		align-items: center;

		.addItem,
		.deleteItem {
			border: 1px dashed var(--el-color-primary);
			height: 23px;
			width: 23px;
			border-radius: 50%;
			display: flex;
			justify-content: center;
			align-items: center;
			cursor: pointer;
		}

		.tips {
			margin-top: 5px;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: xx-small;
		}
	}
}
</style>
