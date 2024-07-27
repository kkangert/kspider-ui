import request from '/@/utils/request';

/**
 * 可视化爬虫\WEB自动化测试工具设计界面
 */
export function useSpiderDesignApi() {
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
				url: '/function/delete',
				method: 'post',
				data: params,
			});
		},

		/**
		 * 查询所有节点执行器
		 * @param params
		 * @returns
		 */
		queryNodeList: () => {
			return request({
				url: '/kspider/nodeList',
				method: 'post',
			});
		},

		/**
		 * 查询指定节点的配置项
		 * @param params
		 * @returns
		 */
		queryNodeConfigItem: (params: object) => {
			return request({
				url: '/kspider/nodeConfigItem',
				method: 'post',
				data: params,
			});
		},

		/**
		 * 获取当前工作流json数据(用于前端渲染流程图)
		 * @param flowId 流程ID
		 * @returns
		 */
		querySpiderFlowJson: (flowId: number) => {
			return request({
				url: '/kspider/flowJson/' + flowId,
				method: 'get',
			});
		},

		/**
		 * 编辑
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
	};
}
