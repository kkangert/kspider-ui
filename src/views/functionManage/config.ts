import { useFunctionApi } from './api';
import { compute, dict, CrudOptions, AddReq, EditReq, DelReq } from '@fast-crud/fast-crud';
import { ElMessage } from 'element-plus';

// 构建crudOptions的方法
export default function ({ crudExpose }: any) {
	const pageRequest = async (query: any) => {
		return await useFunctionApi().query(query);
	};
	const editRequest = async (req: EditReq) => {
		return await useFunctionApi().edit(req.form);
	};
	const delRequest = async (req: DelReq) => {
		return await useFunctionApi().delete({ funcId: req.row.funcId });
	};
	const addRequest = async (req: AddReq) => {
		return await useFunctionApi().add(req.form);
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
			rowKey: 'appId',
		},
		columns: {
			// 字段配置
			funcId: {
				title: '函数ID',
				type: 'text',
				search: { show: false },
				editForm: { show: false },
				viewForm: { show: false },
				addForm: { show: false },
				valueBuilder: () => {},
				valueResolve: () => {},
			},
			name: {
				title: '函数名称',
				search: { show: false },
				editForm: { show: true },
				viewForm: { show: true },
				addForm: { show: true },
				type: 'text',
				valueBuilder: () => {},
				valueResolve: () => {},
			},
			parameter: {
				title: '函数参数',
				search: { show: true },
				column: { show: true },
				editForm: { show: true },
				viewForm: { show: true },
				addForm: { show: true },
				type: 'text',
				valueBuilder: () => {},
				valueResolve: () => {},
			},
			script: {
				title: '函数体',
				search: { show: true },
				column: { show: true },
				editForm: { show: true },
				viewForm: { show: true },
				addForm: { show: true },
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
			remark: {
				title: '备注',
				search: { show: true },
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
