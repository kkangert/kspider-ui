<template>
	<div style="height: calc(100vh - 120px)">
		<fs-crud ref="crudRef" v-bind="crudBinding">
			<!-- APPID生成 -->
			<template #form_appSecretKey="scope">
				<el-input v-model="scope.form.appSecretKey" :disabled="scope.mode === 'view'" placeholder="APP密钥" class="input-with-select">
					<template #append>
						<el-button :disabled="scope.mode === 'view'" :icon="Promotion" @click="makeAppSecretKey(scope)" />
					</template>
				</el-input>
			</template>

		</fs-crud>
	</div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import createCrudOptions from './config';
import { useFs } from '@fast-crud/fast-crud';
import { Promotion } from '@element-plus/icons-vue';
import { v4 as uuidv4 } from 'uuid';
const makeAppSecretKey = (scope: any) => {
	scope.form.appSecretKey = String(uuidv4()).replaceAll('-', '');
};

const customProps = {
	
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
