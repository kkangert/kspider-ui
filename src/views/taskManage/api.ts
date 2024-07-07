import request from '/@/utils/request';

export function useSpiderTaskApi() {
	return {
		/**
		 * 新增
		 * @param params
		 * @returns
		 */
		add: (params: object) => {
			return request({
				url: '/task/add',
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
				url: '/task/delete',
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
				url: '/task/query',
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
				url: '/task/edit',
				method: 'post',
				data: params,
			});
		},
		download: (params: object) => {
			request({
				url: '/task/download',
				method: 'post',
				data: params,
				responseType: 'blob',
			}).then((res: any) => {
				const filename = decodeURI(res.headers['content-disposition'].split(';')[1].split('filename=')[1]);
				let blob = new Blob([res]);
				let url = window.URL.createObjectURL(blob);
				let a = document.createElement('a');
				a.href = url;
				a.download = filename;
				a.click();
				window.URL.revokeObjectURL(url);
			});
			return null;
		},

		runTask: (params: object) => {
			return request({
				url: '/task/run',
				method: 'post',
				data: params,
			});
		},

		stopTask: (params: object) => {
			return request({
				url: '/task/stop',
				method: 'post',
				data: params,
			});
		},
	};
}
