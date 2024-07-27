<template>
	<div class="workflow-container layout-padding">
		<div class="workflow-mask" v-if="state.isShow"></div>
		<div class="layout-padding-auto layout-padding-view workflow-warp">
			<div class="workflow">
				<!-- 顶部工具栏 -->
				<Tool @tool="onToolClick" />

				<!-- 左侧导航区 -->
				<div class="workflow-content">
					<div class="workflow-left">
						<el-scrollbar>
							<div
								ref="leftNavRefs"
								v-for="val in state.leftNavList"
								:key="val.nodeId"
								:style="{ height: val.isOpen ? 'auto' : '50px', overflow: 'hidden' }"
								class="workflow-left-id"
							>
								<div class="workflow-left-title" @click="onTitleClick(val)">
									<span>{{ val.title }}</span>
									<SvgIcon :name="val.isOpen ? 'ele-ArrowDown' : 'ele-ArrowRight'" />
								</div>
								<div
									class="workflow-left-item"
									v-for="(v, k) in val.children"
									:key="k"
									:data-name="v.name"
									:data-label="v.label"
									:data-icon="v.icon"
									:data-nodeId="v.nodeId"
								>
									<div class="workflow-left-item-icon">
										<SvgIcon :name="v.icon" class="workflow-icon-drag" customClass="workflow-icon-drag" />
										<div class="font10 pl5 name">{{ v.label }}</div>
									</div>
								</div>
							</div>
						</el-scrollbar>
					</div>

					<div class="workflow-center">
						<!-- 中间绘画区 -->
						<div class="workflow-center-container" ref="workflowCenterRef">
							<div
								v-for="(v, k) in state.jsplumbData.nodeList"
								:key="v.nodeId"
								:id="v.nodeId"
								:class="v.class"
								:style="{ left: v.left, top: v.top }"
								@click="onItemCloneClick(k)"
								@contextmenu.prevent="onContextmenu(v, k, $event)"
							>
								<div class="workflow-center-box" :class="{ 'workflow-center-active': state.jsPlumbNodeIndex === k }">
									<div class="workflow-left-item-icon">
										<SvgIcon :name="v.icon" class="workflow-icon-drag" customClass="workflow-icon-drag" />
										<div class="font10 pl5 name">{{ v.label }}</div>
									</div>
								</div>
							</div>
						</div>

						<!-- 日志输出 -->
						<div class="debug-log" :style="{ display: state.debugLogList.length > 0 ? '' : 'none' }">
							<el-table ref="debugLogTableRef" :data="state.debugLogList" max-height="162" style="width: 100%">
								<el-table-column fixed prop="date" label="日期" />
								<el-table-column fixed prop="nodeId" label="节点" />
								<el-table-column fixed prop="event" label="事件" />
								<el-table-column fixed prop="event" label="元数据" />
								<el-table-column fixed prop="event" label="日志" />
								<el-table-column fixed prop="key" label="Key" />
								<el-table-column fixed prop="value" label="Value" />
							</el-table>
						</div>
					</div>

					<!-- 右侧节点配置区域 -->
					<div class="workflow-right">
						<Lines v-show="state.rightConfig.type === 'line'" @change="onLineChange" ref="lineRef" />
						<Nodes v-show="state.rightConfig.type === 'node'" @submit="onNodeSubmit" ref="nodeRef" />
					</div>
				</div>
			</div>
		</div>

		<!-- 节点右键菜单 -->
		<Contextmenu :dropdown="state.dropdownNode" ref="contextmenuNodeRef" @current="onCurrentNodeClick" />
		<!-- 线右键菜单 -->
		<Contextmenu :dropdown="state.dropdownLine" ref="contextmenuLineRef" @current="onCurrentLineClick" />

		<!-- 顶部工具栏-帮助弹窗 -->
		<Help ref="helpRef" />
	</div>
</template>

<script setup lang="ts" name="pagesWorkflow">
import { defineAsyncComponent, reactive, onMounted, onUnmounted, nextTick, ref } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { jsPlumb } from 'jsplumb';
import Sortable from 'sortablejs';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';
import { useTagsViewRoutes } from '/@/stores/tagsViewRoutes';
import commonFunction from '/@/utils/commonFunction';
import { jsplumbDefaults, jsplumbMakeSource, jsplumbMakeTarget, jsplumbConnect } from './js/config';
import { useSpiderDesignApi } from './api';
import { Session } from '/@/utils/storage';
import { formatDate } from '/@/utils/formatTime';
const route = useRoute();

// 引入组件
const Tool = defineAsyncComponent(() => import('./component/tool/index.vue'));
const Contextmenu = defineAsyncComponent(() => import('./component/contextmenu/index.vue'));
const Lines = defineAsyncComponent(() => import('./component/drawer/line.vue'));
const Nodes = defineAsyncComponent(() => import('./component/drawer/node.vue'));
const Help = defineAsyncComponent(() => import('./component/tool/help.vue'));

// 定义变量内容
const leftNavRefs = ref([]);
const workflowCenterRef = ref();
const contextmenuNodeRef = ref();
const contextmenuLineRef = ref();
const helpRef = ref();

// 调试日志表格对象
const debugLogTableRef = ref();

// 线条与节点对象
const lineRef = ref();
const nodeRef = ref();
const stores = useTagsViewRoutes();
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);
const { copyText } = commonFunction();
const state = reactive<WorkflowState>({
	// @ts-ignore
	socket: {},
	leftNavList: [],
	dropdownNode: { x: '', y: '' },
	dropdownLine: { x: '', y: '' },
	isShow: false,
	jsPlumb: null,
	jsPlumbNodeIndex: null,
	jsplumbDefaults,
	jsplumbMakeSource,
	jsplumbMakeTarget,
	jsplumbConnect,
	jsplumbData: {
		nodeList: [],
		lineList: [],
	},
	jsplumbConn: {},
	rightConfig: {},
	debugLogList: [],
});

// 设置 宽度小于 768，不支持操
const setClientWidth = () => {
	const clientWidth = document.body.clientWidth;
	clientWidth < 768 ? (state.isShow = true) : (state.isShow = false);
};

/**
 * 创建websocket
 */
const createWebSocket = () => {
	let apiUrl = String(window.location.origin);
	if (apiUrl.includes('https')) {
		apiUrl = apiUrl.replace('https', 'wss');
	} else {
		apiUrl = apiUrl.replace('http', 'ws');
	}
	state.socket = new WebSocket(apiUrl + '/ws?token=' + Session.get('token'));
	state.socket.onopen = (ev) => {};
	state.socket.onmessage = (ev) => {
		if (ev) {
			let socketData = JSON.parse(ev.data);
			switch (socketData.eventType) {
				case 'debug':
					socketData.message['date'] = formatDate(new Date(), 'YYYY-mm-dd HH:MM:SS');
					state.debugLogList.push(socketData.message);

					// 自动切换执行节点执行器
					let nodeIndex = state.jsplumbData.nodeList.findIndex((item) => item.nodeId == socketData.message.nodeId);
					if (nodeIndex != -1) {
						state.jsPlumbNodeIndex = nodeIndex;
					}

					// 需要等待dom渲染完毕后
					nextTick(() => {
						// 自动滚动到最后一条数据的位置
						debugLogTableRef.value.scrollTo(0, 9999);
					});
					break;
				default:
					break;
			}
		}
	};
	state.socket.onclose = (ev) => {
		// createWebSocket();
	};
	state.socket.onerror = (ev) => {
		ElMessage.error({ message: '初始化Kspider设计器WebSocket失败, 请刷新页面' });
	};
};

/**
 * 更新Icon,保证Icon与前端项目一致
 * @param nodeName 节点名称
 */
const upadateIcon = (nodeName: string) => {
	try {
		let nodeList = state.leftNavList[0].children.filter((item: any) => item.name == nodeName);
		if (nodeList.length > 0) {
			return nodeList[0].icon;
		} else {
			return null;
		}
	} catch (error) {
		return null;
	}
};

// 左侧导航-数据初始化
const initLeftNavList = async () => {
	// 获取可用执行器节点
	let resData = await useSpiderDesignApi().queryNodeList();

	// 转换对象
	let tempData = await resData.data.map((item: any) => {
		item['nodeId'] = '';
		item['form'] = [];
		return item;
	});

	let tempLeftNavList: Array<any> = [];
	tempLeftNavList.push({
		title: '执行器节点',
		icon: 'iconfont icon-shouye',
		isOpen: true,
		nodeId: '1',
		children: tempData,
	});
	state.leftNavList = tempLeftNavList;
};

/***
 * 初始化爬虫的流程渲染图
 */
const initSpiderFlow = async () => {
	let resData = await useSpiderDesignApi().querySpiderFlowJson(Number(route.params.flowId));
	if (resData.data.json) {
		let tempData = JSON.parse(resData.data.json);

		// 更新Icon,保持与前端项目一致
		tempData.nodeList = tempData.nodeList.map((item: any) => {
			let icon = upadateIcon(item.name);
			if (icon) {
				item.icon = icon;
			}
			return item;
		});
		state.jsplumbData = tempData;
	} else {
		let nodeId = makeNodeId();
		state.jsplumbData = {
			nodeList: [
				{
					nodeId: nodeId,
					left: '71px',
					top: '67px',
					class: 'workflow-center-clone',
					name: 'start',
					label: '开始',
					form: [],
					icon: 'ele-Flag',
				},
			],
			lineList: [],
		};
	}
};

// 左侧导航-初始化拖动
const initSortable = () => {
	leftNavRefs.value.forEach((v) => {
		Sortable.create(v as HTMLDivElement, {
			group: {
				name: 'kspider',
				pull: 'clone',
				put: false,
			},
			animation: 0,
			sort: false,
			draggable: '.workflow-left-item',
			forceFallback: true,
			onEnd: function (evt: any) {
				const { name, icon, nodeId, label } = evt.clone.dataset;
				const { layerX, layerY, clientX, clientY } = evt.originalEvent;
				const el = workflowCenterRef.value!;
				const { x, y, width, height } = el.getBoundingClientRect();
				if (clientX < x || clientX > width + x || clientY < y || y > y + height) {
					ElMessage.warning('请把节点拖入到画布中');
				} else {
					// 节点id（唯一）
					const nodeId = makeNodeId();
					// 处理节点数据
					const node = {
						nodeId,
						left: `${layerX - 40}px`,
						top: `${layerY - 15}px`,
						class: 'workflow-center-clone',
						name,
						label,
						form: [],
						icon,
					};
					// 右侧视图内容数组
					state.jsplumbData.nodeList.push(node);
					// 元素加载完毕时
					nextTick(() => {
						// 整个节点作为source或者target
						state.jsPlumb.makeSource(nodeId, state.jsplumbMakeSource);
						// // 整个节点作为source或者target
						state.jsPlumb.makeTarget(nodeId, state.jsplumbMakeTarget, jsplumbConnect);
						// 设置节点可以拖拽（此处为id值，非class）
						state.jsPlumb.draggable(nodeId, {
							containment: 'parent',
							stop: (el: any) => {
								state.jsplumbData.nodeList.forEach((v) => {
									if (v.nodeId === el.el.nodeId) {
										// 节点x, y重新赋值，防止再次从左侧导航中拖拽节点时，x, y恢复默认
										v.left = `${el.pos[0]}px`;
										v.top = `${el.pos[1]}px`;
									}
								});
							},
						});
					});
				}
			},
		});
	});
};
// 初始化 jsPlumb
const initJsPlumb = () => {
	(<any>jsPlumb).ready(() => {
		state.jsPlumb = (<any>jsPlumb).getInstance({
			detachable: false,
			Container: 'workflow-center-container',
		});
		state.jsPlumb.fire('jsPlumbDemoLoaded', state.jsPlumb);
		// 导入默认配置
		state.jsPlumb.importDefaults(state.jsplumbDefaults);
		// 会使整个jsPlumb立即重绘。
		state.jsPlumb.setSuspendDrawing(false, true);
		// 初始化节点、线的链接
		initJsPlumbConnection();
		// 点击线弹出右键菜单
		state.jsPlumb.bind('contextmenu', (conn: any, originalEvent: MouseEvent) => {
			originalEvent.preventDefault();
			const { sourceId, targetId } = conn;
			const { clientX, clientY } = originalEvent;
			state.dropdownLine.x = clientX;
			state.dropdownLine.y = clientY;

			// 查找连接线
			const line: any = state.jsplumbData.lineList.find((v) => v.sourceId === sourceId && v.targetId === targetId);
			line['type'] = 'line';
			contextmenuLineRef.value.openContextmenu(line, conn);
		});
		// 连线之前
		state.jsPlumb.bind('beforeDrop', (conn: any) => {
			const { sourceId, targetId } = conn;
			const item = state.jsplumbData.lineList.find((v) => v.sourceId === sourceId && v.targetId === targetId);
			if (item) {
				ElMessage.warning('关系已存在，不可重复连接');
				return false;
			} else {
				return true;
			}
		});
		// 连线时
		state.jsPlumb.bind('connection', (conn: any) => {
			const { sourceId, targetId } = conn;
			state.jsplumbData.lineList.push({
				sourceId,
				targetId,
				label: '',
				exceptionFlow: 2,
				condition: '',
				transmitVariable: true,
			});
		});
		// 删除连线时回调函数
		state.jsPlumb.bind('connectionDetached', (conn: any) => {
			const { sourceId, targetId } = conn;
			state.jsplumbData.lineList = state.jsplumbData.lineList.filter((line) => {
				if (line.sourceId == sourceId && line.targetId == targetId) {
					return false;
				}
				return true;
			});
		});
	});
};
// 初始化节点、线的链接
const initJsPlumbConnection = () => {
	// 节点
	state.jsplumbData.nodeList.forEach((v) => {
		// 整个节点作为source或者target
		state.jsPlumb.makeSource(v.nodeId, state.jsplumbMakeSource);
		// 整个节点作为source或者target
		state.jsPlumb.makeTarget(v.nodeId, state.jsplumbMakeTarget, jsplumbConnect);
		// 设置节点可以拖拽（此处为id值，非class）
		state.jsPlumb.draggable(v.nodeId, {
			containment: 'parent',
			stop: (el: any) => {
				state.jsplumbData.nodeList.forEach((v) => {
					if (v.nodeId === el.el.id) {
						// 节点x, y重新赋值，防止再次从左侧导航中拖拽节点时，x, y恢复默认
						v.left = `${el.pos[0]}px`;
						v.top = `${el.pos[1]}px`;
					}
				});
			},
		});
	});
	// 线
	state.jsplumbData.lineList.forEach((v) => {
		state.jsPlumb.connect(
			{
				source: v.sourceId,
				target: v.targetId,
				label: v.label,
			},
			state.jsplumbConnect
		);
	});
};

/**
 * 生成随机节点ID
 */
const makeNodeId = () => {
	return Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
};

// 左侧导航-菜单标题点击
const onTitleClick = (val: any) => {
	val.isOpen = !val.isOpen;
};
// 右侧内容区-当前项点击
const onItemCloneClick = (k: number) => {
	state.jsPlumbNodeIndex = k;
};

// 右侧内容区-当前项右键菜单点击
const onContextmenu = (v: any, k: number, e: MouseEvent) => {
	state.jsPlumbNodeIndex = k;
	const { clientX, clientY } = e;
	state.dropdownNode.x = clientX;
	state.dropdownNode.y = clientY;
	v['type'] = 'node';
	contextmenuNodeRef.value.openContextmenu(v);
};

// 右侧内容区-当前项右键菜单点击回调(节点)
const onCurrentNodeClick = (item: any) => {
	const { contextMenuClickId, nodeId } = item;
	// 删除
	if (contextMenuClickId === 0) {
		const nodeIndex = state.jsplumbData.nodeList.findIndex((item) => item.nodeId === nodeId);
		state.jsplumbData.nodeList.splice(nodeIndex, 1);
		state.jsPlumb.removeAllEndpoints(nodeId);
		state.jsPlumbNodeIndex = null;
	}
	// 编辑
	else if (contextMenuClickId === 1) {
		nextTick(() => {
			// 获取指定执行器的配置项
			state.rightConfig = item;

			// 查询配置项
			useSpiderDesignApi()
				.queryNodeConfigItem({ flowId: Number(route.params.flowId), nodeId: item.nodeId, nodeName: item.name })
				.then((res) => {
					item['form'] = res.data;
					nodeRef.value.getParentData(item);
				});
		});
	}
};

// 右侧内容区-当前项右键菜单点击回调(线)
const onCurrentLineClick = (item: any, conn: any) => {
	const { contextMenuClickId } = item;
	const { endpoints } = conn;
	const intercourse: any = [];
	endpoints.forEach((v: any) => {
		intercourse.push({
			nodeId: v.element.id,
			innerText: v.element.innerText,
		});
	});
	item.contact = `${intercourse[0].innerText}(${intercourse[0].nodeId}) -> ${intercourse[1].innerText}(${intercourse[1].nodeId})`;
	if (contextMenuClickId === 0) state.jsPlumb.deleteConnection(conn);
	else if (contextMenuClickId === 1) {
		nextTick(() => {
			state.rightConfig = item;

			// 记录当前连接线
			state.jsplumbConn = conn;

			lineRef.value.getParentData(item);
		});
	}
};

// 线 label 内容改变时
const onLineChange = (data: any) => {
	state.jsplumbConn.label = data.label;
	const { sourceId, targetId, label } = state.jsplumbConn;
	const conn = state.jsPlumb.getConnections({
		source: sourceId,
		target: targetId,
	})[0];
	conn.setLabel(label);
	if (!label || label === '') {
		conn.addClass('workflow-center-empty-label');
	} else {
		conn.removeClass('workflow-center-empty-label');
		conn.addClass('workflow-center-label');
	}
	state.jsplumbData.lineList.forEach((v) => {
		if (v.sourceId === sourceId && v.targetId === targetId) {
			v.label = label;
			v.exceptionFlow = data.exceptionFlow;
			v.condition = data.condition;
			v.transmitVariable = data.transmitVariable;
		}
	});
};

// 节点内容改变时
const onNodeSubmit = (data: any) => {
	const { nodeId, name, icon, label, form } = data;
	// 设置节点 name 与 icon
	state.jsplumbData.nodeList.forEach((v: any) => {
		if (v.nodeId === nodeId) {
			v.name = name;
			v.icon = icon;
			v.label = label;
			v.form = form;
		}
	});
	// 重绘
	nextTick(() => {
		state.jsPlumb.setSuspendDrawing(false, true);
	});
};

// 顶部工具栏-当前项点击
const onToolClick = (fnName: String) => {
	switch (fnName) {
		case 'help':
			onToolHelp();
			break;
		case 'test':
			onToolTestOrDebug(false);
			break;
		case 'debug':
			onToolTestOrDebug(true);
			break;
		case 'resume':
			onToolResume();
			break;
		case 'stopDebug':
			onToolStop();
			break;
		case 'download':
			onToolDownload();
			break;
		case 'submit':
			onToolSubmit();
			break;
		case 'copy':
			onToolCopy();
			break;
		case 'del':
			onToolDel();
			break;
		case 'fullscreen':
			onToolFullscreen();
			break;
	}
};
// 顶部工具栏-帮助
const onToolHelp = () => {
	nextTick(() => {
		helpRef.value.open();
	});
};

// 开启爬虫测试、调试(单步)
const onToolTestOrDebug = (debug = false) => {
	let data = JSON.stringify({
		eventType: debug ? 'debug' : 'test',
		message: state.jsplumbData,
	});
	state.socket.send(data);
};

/**
 * 恢复执行
 */
const onToolResume = () => {
	let data = JSON.stringify({
		eventType: 'resume',
	});
	state.socket.send(data);
};

/**
 * 停止调试
 */
const onToolStop = () => {
	let data = JSON.stringify({
		eventType: 'stop',
	});
	state.socket.send(data);
};

// 顶部工具栏-下载
const onToolDownload = () => {
	const { globalTitle } = themeConfig.value;
	const href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state.jsplumbData, null, '\t'));
	const aLink = document.createElement('a');
	aLink.setAttribute('href', href);
	aLink.setAttribute('download', `${globalTitle}工作流.json`);
	aLink.click();
	aLink.remove();
	ElMessage.success('下载成功');
};
// 顶部工具栏-提交
const onToolSubmit = () => {
	useSpiderDesignApi()
		.edit({ flowId: Number(route.params.flowId), json: JSON.stringify(state.jsplumbData) })
		.then((res) => {
			ElMessage.success('数据提交成功');
		});
};
// 顶部工具栏-复制
const onToolCopy = () => {
	copyText(JSON.stringify(state.jsplumbData));
};
// 顶部工具栏-删除
const onToolDel = () => {
	ElMessageBox.confirm('此操作将清空画布，是否继续？', '提示', {
		confirmButtonText: '清空',
		cancelButtonText: '取消',
	})
		.then(() => {
			state.jsplumbData.nodeList.forEach((v) => {
				state.jsPlumb.removeAllEndpoints(v.nodeId);
			});
			nextTick(() => {
				state.jsplumbData = {
					nodeList: [],
					lineList: [],
				};
				ElMessage.success('清空画布成功');
			});
		})
		.catch(() => {});
};
// 顶部工具栏-全屏
const onToolFullscreen = () => {
	stores.setCurrenFullscreen(true);
};
// 页面加载时
onMounted(async () => {
	await createWebSocket();
	await initLeftNavList();
	await initSpiderFlow();
	await initSortable();
	await initJsPlumb();
	await setClientWidth();
	window.addEventListener('resize', setClientWidth);
});
// 页面卸载时
onUnmounted(() => {
	window.removeEventListener('resize', setClientWidth);

	// 关闭websocket
	state.socket.close();
});
</script>

<style scoped lang="scss">
.workflow-container {
	position: relative;
	.workflow-warp {
		position: relative;
	}
	.workflow {
		display: flex;
		height: 100%;
		width: 100%;
		flex-direction: column;
		position: absolute;
		top: 0;
		left: 0;
		.workflow-content {
			display: flex;
			flex-direction: row;
			height: calc(100% - 35px);

			.workflow-left,
			.workflow-right {
				width: 220px;
				height: 100%;
				border-right: 1px solid var(--el-border-color-light, #ebeef5);
				:deep(.el-collapse-item__content) {
					padding-bottom: 0;
				}
				.workflow-left-title {
					height: 50px;
					display: flex;
					align-items: center;
					padding: 0 10px;
					border-top: 1px solid var(--el-border-color-light, #ebeef5);
					color: var(--el-text-color-primary);
					cursor: default;
					span {
						flex: 1;
					}
				}
				.workflow-left-item {
					display: inline-block;
					width: calc(50% - 15px);
					position: relative;
					cursor: move;
					margin: 0 0 10px 10px;
					.workflow-left-item-icon {
						height: 35px;
						display: flex;
						align-items: center;
						transition: all 0.3s ease;
						padding: 5px 10px;
						border: 1px dashed transparent;
						background: var(--next-bg-color);
						border-radius: 3px;
						i,
						.name {
							color: var(--el-text-color-secondary);
							transition: all 0.3s ease;
							white-space: nowrap;
							text-overflow: ellipsis;
							overflow: hidden;
						}
						&:hover {
							transition: all 0.3s ease;
							border: 1px dashed var(--el-color-primary);
							background: var(--el-color-primary-light-9);
							border-radius: 5px;
							i,
							.name {
								transition: all 0.3s ease;
								color: var(--el-color-primary);
							}
						}
					}
				}
				& .workflow-left-id:first-of-type {
					.workflow-left-title {
						border-top: none;
					}
				}
			}

			.workflow-center {
				flex: 1;
				display: flex;
				flex-direction: column;

				.workflow-center-container {
					flex: 3;
					display: flex;
					flex-direction: column;
					position: relative;
					overflow: hidden;
					height: 100%;
					background-image: linear-gradient(90deg, rgb(156 214 255 / 15%) 10%, rgba(0, 0, 0, 0) 10%),
						linear-gradient(rgb(156 214 255 / 15%) 10%, rgba(0, 0, 0, 0) 10%);
					background-size: 10px 10px;

					.workflow-center-clone {
						position: absolute;
						.workflow-center-box {
							height: 35px;
							align-items: center;
							color: var(--el-text-color-secondary);
							padding: 0 10px;
							border-radius: 3px;
							cursor: move;
							transition: all 0.3s ease;
							min-width: 94.5px;
							background: var(--el-color-white);
							border: 1px solid var(--el-border-color-light, #ebeef5);
							.workflow-left-item-icon {
								display: flex;
								align-items: center;
								height: 35px;
							}
							&:hover {
								border: 1px dashed var(--el-color-primary);
								background: var(--el-color-primary-light-9);
								transition: all 0.3s ease;
								color: var(--el-color-primary);
								i {
									cursor: Crosshair;
								}
							}
						}
						.workflow-center-active {
							border: 1px dashed var(--el-color-primary);
							background: var(--el-color-primary-light-9);
							color: var(--el-color-primary);
						}
					}
					:deep(.jtk-overlay):not(.aLabel) {
						padding: 4px 10px;
						border: 1px solid var(--el-border-color-light, #ebeef5) !important;
						color: var(--el-text-color-secondary) !important;
						background: var(--el-color-white) !important;
						border-radius: 3px;
						font-size: 10px;
					}
					:deep(.jtk-overlay.workflow-center-empty-label) {
						display: none;
					}
				}

				.debug-log {
					flex: 1;
					height: 100px;
					border-top: 1px solid var(--el-border-color-light, #ebeef5);
				}
			}

			.workflow-right {
				border-right: none;
				border-left: 1px solid var(--el-border-color-light, #ebeef5);
				width: 350px;
			}
		}
	}
	.workflow-mask {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		&::after {
			content: '请使用大屏进行爬虫流程设计';
			position: absolute;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			z-index: 1;
			background: rgba(255, 255, 255, 0.9);
			color: #666666;
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}
}
</style>
