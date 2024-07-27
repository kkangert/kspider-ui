import request from '/@/utils/request';

/**
 * App应用管理API接口集合
 */
export function useSpiderApi() {
	return {
		/**
		 * 新增
		 * @param params
		 * @returns
		 */
		add: (params: object) => {
			return request({
				url: '/kspider/add',
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
				url: '/kspider/delete',
				method: 'post',
				data: params,
			});
		},

		/**
		 * 修改
		 * @param params
		 * @returns
		 */
		edit: (params: object) => {
			return request({
				url: '/kspider/edit',
				method: 'post',
				data: params,
			});
		},

		/**
		 * 查询
		 * @param params
		 * @returns
		 */
		query: (params: object) => {
			return request({
				url: '/kspider/query',
				method: 'post',
				data: params,
			});
		},
	};
}
