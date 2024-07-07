import request from '/@/utils/request';

/**
 * App应用管理API接口集合
 */
export function useFunctionApi() {
	return {
		/**
		 * 新增
		 * @param params
		 * @returns
		 */
		add: (params: object) => {
			return request({
				url: '/function/add',
				method: 'post',
				data: params,
			});
		},

		/**
		 * 删除
		 * @param params
		 * @returns
		 */
		delete: (params: object) => {
			return request({
				url: '/function/delete',
				method: 'post',
				data: params,
			});
		},

		/**
		 * 分页查询
		 * @param params
		 * @returns
		 */
		query: (params: object) => {
			return request({
				url: '/function/query',
				method: 'post',
				data: params,
			});
		},

		/**
		 * 编辑
		 * @param params
		 * @returns
		 */
		edit: (params: object) => {
			return request({
				url: '/function/edit',
				method: 'post',
				data: params,
			});
		},
	};
}
