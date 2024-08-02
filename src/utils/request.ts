import axios, { AxiosInstance } from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Session } from '/@/utils/storage';
import qs from 'qs';

// 配置新建一个 axios 实例
const service: AxiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL as any,
	timeout: 50000,
	headers: { 'Content-Type': 'application/json' },
	paramsSerializer: {
		serialize(params) {
			return qs.stringify(params, { allowDots: true });
		},
	},
});

// 添加请求拦截器
service.interceptors.request.use(
	(config) => {
		// 在发送请求之前做些什么 token
		if (Session.get('token')) {
			config.headers!['Authorization'] = `${Session.get('token')}`;
		}
		return config;
	},
	(error) => {
		// 对请求错误做些什么
		return Promise.reject(error);
	}
);

// 添加响应拦截器
service.interceptors.response.use(
	(response) => {

		// 对响应数据做点什么
		const res = response.data;

		// 二进制
		if (response.request.responseType === 'blob' || response.request.responseType === 'arraybuffer') {
			if (res.type === 'application/json') {
				const reader = new FileReader();
				reader.readAsText(res);
				reader.onload = () => {
					// TODO 错误处理
					ElMessage.error({ message: JSON.parse(reader.result).message });
				};
				return Promise.reject(service.interceptors.response);
			} else {
				// 暴露响应头
				Object.assign(response.data, { headers: response.headers });
				return response.data;
			}
		} else {
			// 结构化数据
			if (res.code && res.code !== 0) {
				// token过期、缓存异常
				if (res.code === 5 || res.code === 6 || res.code == 12 || res.code === 13) {
					Session.clear(); // 清除浏览器全部临时缓存
					ElMessageBox.alert(res.message, '提示', {})
						.then(() => {
							window.location.href = '/'; // 去登录页
						})
						.catch(() => {});
				} else {
					ElMessage.error({ message: res.message });
				}
				return Promise.reject(service.interceptors.response);
			} else {
				// 暴露响应头
				Object.assign(response.data, { headers: response.headers });
				return response.data;
			}
		}
	},
	(error) => {
		// 对响应错误做点什么
		if (error.message.indexOf('timeout') != -1) {
			ElMessage.error('网络超时');
		} else if (error.message == 'Network Error') {
			ElMessage.error('网络连接错误');
		} else {
			if (error.response.data) ElMessage.error(error.response.statusText);
			else ElMessage.error('接口路径找不到');
		}
		return Promise.reject(error);
	}
);

// 导出 axios 实例
export default service;
