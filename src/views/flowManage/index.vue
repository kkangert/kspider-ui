<template>
	<div style="height: calc(100vh - 120px)">
		<fs-crud ref="crudRef" v-bind="crudBinding"> </fs-crud>
	</div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
import createCrudOptions from './config';
import { useFs } from '@fast-crud/fast-crud';

const router = useRouter();

const customProps = { router };

// crud初始化
const { crudRef, crudBinding, crudExpose } = useFs({ createCrudOptions, context: customProps });

onMounted(() => {
	crudExpose.doRefresh();
});
</script>

<style scoped lang="scss"></style>
