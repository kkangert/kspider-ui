import { useSpiderTaskApi } from './api';
import { CrudOptions, AddReq, EditReq, DelReq, dict } from '@fast-crud/fast-crud';
import { ref } from 'vue';
import { useSpiderApi } from '/@/views/spiderManage/api';

const spiderList = ref([]);
const searchSpiderLoadding = ref(false);

// 构建crudOptions的方法
export default function ({ crudExpose }: any) {
	const pageRequest = async (query: any) => {
		return await useSpiderTaskApi().query(query);
	};
	const editRequest = async (req: EditReq) => {
		return await useSpiderTaskApi().edit(req.form);
	};
	const delRequest = async (req: DelReq) => {
		return await useSpiderTaskApi().delete({ taskId: req.row.taskId });
	};
	const addRequest = async (req: AddReq) => {
		return await useSpiderTaskApi().add(req.form);
	};

	let crudOptions: CrudOptions = {
		//请求配置
		request: {
			pageRequest, // 列表数据请求
			addRequest, // 添加请求
			editRequest, // 修改请求
			delRequest, // 删除请求
		},
		rowHandle: {
			buttons: {
				view: {},
				remove: {
					// 根据row的值判断按钮是否显示
					// show: compute(({ row }: any) => {
					// 	return row.radio !== '0';
					// }),
					show: false,
					dropdown: true, //---------》给想要折叠的按钮配置dropdown为true，就会放入dropdown中《---------------
				},
				edit: {
					show: true,
					dropdown: true,
				},
				runSpiderTask: {
					text: '运行任务',
					dropdown: true,
					click(ctx: any) {
						useSpiderTaskApi().runTask({ taskId: ctx.row.taskId });
					},
				},
				stopSpiderTask: {
					text: '暂停任务',
					dropdown: true,
					click(ctx: any) {
						useSpiderTaskApi().stopTask({ taskId: ctx.row.taskId });
					},
				},
				downloadFile: {
					text: '产物下载',
					dropdown: true,
					async click(ctx: any) {
						useSpiderTaskApi().download({ taskId: ctx.row.taskId });
					},
				},
			},
			dropdown: {
				// 操作列折叠，dropdown参数配置
				// 至少几个以上的按钮才会被折叠
				// atLeast: 2, //TODO 注意 [atLeast]参数即将废弃，请给button配置dropdown即可放入折叠
				// more: {
				// 	//更多按钮配置
				// 	text: '更多',
				// 	icon: 'ArrowDown',
				// 	click: () => {},
				// },
			},
		},
		table: {
			rowKey: 'taskId',
		},
		columns: {
			// 字段配置
			taskId: {
				title: '任务ID',
				type: 'text',
				search: { show: false },
				editForm: { show: false },
				viewForm: { show: false },
				addForm: { show: false },
				valueBuilder: () => {},
				valueResolve: () => {},
			},
			taskName: {
				title: '任务名称',
				search: { show: true },
				editForm: { show: true },
				viewForm: { show: true },
				addForm: { show: true },
				type: 'text',
				valueBuilder: () => {},
				valueResolve: () => {},
			},
			flowId: {
				title: '所属流程',
				type: 'dict-select',
				form: {
					component: {
						name: 'fs-dict-select',
						multiple: false,
						filterable: true,
						remote: true,
						'reserve-keyword': true,
						placeholder: '输入远程搜索',
						options: spiderList,
						remoteMethod: (query: string) => {
							if (query !== '') {
								searchSpiderLoadding.value = true;
								useSpiderApi()
									.query({ name: query })
									.then((res) => {
										spiderList.value = res.data.map((item: any) => {
											return {
												label: item['name'],
												value: item['flowId'],
											};
										});
									})
									.finally(() => {
										searchSpiderLoadding.value = false;
									});
							} else {
								spiderList.value = [];
							}
						},
						loading: searchSpiderLoadding.value,
					},
				},
				search: { show: true },
				editForm: { show: true },
				viewForm: { show: true },
				addForm: { show: true },
				valueBuilder: () => {},
				valueResolve: () => {},
			},
			runState: {
				title: '运行状态',
				type: 'dict-select',
				dict: dict({
					data: [
						{ label: '任务创建', value: 1 },
						{ label: '任务执行', value: 2 },
						{ label: '任务错误', value: 3 },
						{ label: '任务完成', value: 4 },
					],
				}),
				search: { show: true },
				editForm: { show: false },
				viewForm: { show: true },
				addForm: { show: false },
				valueBuilder: (context) => {},
				valueResolve: (context) => {},
			},
			cron: {
				title: '定时规则',
				form: {
					// component: {
					// 	name: shallowRef(MakeCron),
					// 	on: {
					// 		fill: (ctx) => {
					// 			console.log('xxxx', ctx);
					// 		},
					// 	},
					// },
				},
				search: { show: false },
				editForm: { show: true },
				viewForm: { show: true },
				addForm: { show: true },
				type: 'text',
				valueBuilder: () => {},
				valueResolve: () => {},
			},
			jobEnabled: {
				title: '开启定时',
				form: {
					component: {
						name: 'el-switch',
						activeText: '开启',
						inactiveText: '关闭',
					},
				},
				search: { show: false },
				editForm: { show: true },
				viewForm: { show: true },
				addForm: { show: true },
				type: 'text',
				valueBuilder: () => {},
				valueResolve: () => {},
			},
			matedata: {
				title: '元数据',
				search: { show: false },
				column: { show: false },
				editForm: { show: true },
				viewForm: { show: true },
				addForm: { show: true },
				type: 'text',
				valueBuilder: () => {},
				valueResolve: () => {},
			},
			executeCount: {
				title: '执行次数',
				search: { show: false },
				column: { show: true },
				editForm: { show: false },
				viewForm: { show: true },
				addForm: { show: false },
				type: 'text',
				valueBuilder: () => {},
				valueResolve: () => {},
			},
			lastExecuteTime: {
				title: '上次执行时间',
				search: { show: false },
				editForm: { show: false },
				viewForm: { show: true },
				addForm: { show: false },
				type: 'text',
				valueBuilder: () => {},
				valueResolve: () => {},
			},
			nextExecuteTime: {
				title: '下次执行时间',
				search: { show: false },
				editForm: { show: false },
				viewForm: { show: true },
				addForm: { show: false },
				type: 'text',
				valueBuilder: () => {},
				valueResolve: () => {},
			},
			createTime: {
				title: '创建时间',
				search: { show: false },
				editForm: { show: false },
				viewForm: { show: true },
				addForm: { show: false },
				type: 'text',
				valueBuilder: () => {},
				valueResolve: () => {},
			},
			updateTime: {
				title: '更新时间',
				search: { show: false },
				editForm: { show: false },
				viewForm: { show: true },
				addForm: { show: false },
				type: 'text',
				valueBuilder: () => {},
				valueResolve: () => {},
			},
			remark: {
				title: '备注',
				search: { show: true },
				editForm: { show: true },
				viewForm: { show: true },
				addForm: { show: true },
				type: 'text',
				valueBuilder: () => {},
				valueResolve: () => {},
			},
			// 你可以尝试在此处增加更多字段
		},
		// 其他crud配置
	};
	return { crudOptions };
}
