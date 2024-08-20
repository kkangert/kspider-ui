import request from '/@/utils/request';

/**
 * App应用管理API接口集合
 */
export function useAppApi() {
	return {
		/**
		 * 新增APP
		 * @param params
		 * @returns
		 */
		addApp: (params: object) => {
			return request({
				url: '/app/add',
				method: 'post',
				data: params,
			});
		},

		/**
		 * 修改APP
		 * @param params 
		 * @returns 
		 */
		editApp: (params: object) => {
			return request({
				url: '/app/edit',
				method: 'post',
				data: params,
			});
		},

		/**
		 * 禁用\启用APP
		 * @param params
		 * @returns
		 */
		deleteApp: (params: object) => {
			return request({
				url: '/app/delete',
				method: 'post',
				data: params,
			});
		},

		/**
		 * 分页查询应用列表
		 * @param params
		 * @returns
		 */
		queryApp: (params: object) => {
			return request({
				url: '/app/query',
				method: 'post',
				data: params,
			});
		},

		/**
		 * 模型绑定
		 * @param params
		 * @returns
		 */
		binModel: (params: object) => {
			return request({
				url: '/app/bindModel',
				method: 'post',
				data: params,
			});
		},

		/**
		 * 模型解绑
		 * @param params
		 * @returns
		 */
		unbindModel: (params: object) => {
			return request({
				url: '/app/unbindModel',
				method: 'post',
				data: params,
			});
		},

		/**
		 * 查询绑定关系
		 * @param params
		 */
		queryBindInfo: (params: object) => {
			return request({
				url: '/app/queryBindInfo',
				method: 'post',
				data: params,
			});
		},

		/**
		 * 绑定回调地址
		 * @param params 绑定所需参数
		 * @returns
		 */
		bindCallbackUrl: (params: Array<any>) => {
			return request({
				url: '/app/addCallbackUrl',
				method: 'post',
				data: params,
			});
		},
	};
}
