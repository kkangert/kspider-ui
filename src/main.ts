import { createApp } from 'vue';

import App from './App.vue';
import other from '/@/utils/other';
import request from './utils/request';

import '/@/theme/index.scss';

const app = createApp(App);

// 使用自定义指令
import { directive } from '/@/directive/index';
directive(app);

// 使用国际化插件
import { i18n } from '/@/i18n/index';
app.use(i18n);

// 使用element-plus
import ElementPlus, { ElMessage } from 'element-plus';
import 'element-plus/dist/index.css';
app.use(ElementPlus, { i18n: i18n.global.t, size: 'small' });

// 使用pinia
import pinia from '/@/stores/index';
app.use(pinia);

// 使用vueRouter
import router from './router';
app.use(router);

// 使用fast-crud中的iconify图标
import '@purge-icons/generated';

// 使用fast-crud
import { FastCrud, setLogger } from '@fast-crud/fast-crud';
import '@fast-crud/fast-crud/dist/style.css';
import uielement from '@fast-crud/ui-element';
// 设置日志等级
setLogger({ level: 'info' });
app.use(uielement);
// 然后安装FastCrud
app.use(FastCrud, {
	//i18n配置，可选，默认使用中文，具体用法请看demo里的 src/i18n/index.js 文件
	i18n,
	// 此处配置公共的dictRequest（字典请求）
	async dictRequest({ dict }: any) {
		return await request({ url: dict.url, method: 'POST', data: { pageSize: 999, currentPage: 1 } }); //根据dict的url，异步返回一个字典数组
	},
	//公共crud配置
	commonOptions() {
		return {
			pagination: {
				pageSize: 5,
			},
			container: {
				is: 'fs-layout-card',
			},
			search: {
				layout: 'multi-line',
				col: {
					span: 8,
				},
				buttonsPosition: 'right',
				collapse: true,
				options: {
					labelWidth: '80px',
				},
			},
			form: {
				wrapper: {
					is: 'el-drawer',
					size: '50%', //抽屉宽度50%
					closeOnClickModal: false,
				},
			},
			table: {
				fit: true,
				onCellDblclick: (row, column, cell, event) => {
					try {
						let element = cell.children[0].children[0];
						// navigator clipboard 需要https等安全上下文
						if (navigator.clipboard && window.isSecureContext) {
							// navigator clipboard 向剪贴板写文本
							navigator.clipboard.writeText(element.innerText);
							ElMessage.success('已复制内容: ' + element.innerText);
						} else {
							// 创建text area
							let textArea = document.createElement('textarea');
							textArea.value = element.innerText;
							// 使text area不在viewport，同时设置不可见
							textArea.style.position = 'absolute';
							textArea.style.opacity = 0;
							textArea.style.left = '-999999px';
							textArea.style.top = '-999999px';
							document.body.appendChild(textArea);
							textArea.focus();
							textArea.select();

							// 执行复制命令并移除文本框
							document.execCommand('copy');
							textArea.remove();
							ElMessage.success('已复制内容: ' + element.innerText);
						}
					} catch (error) {
						ElMessage.error('复制内容失败:' + error);
					}
				},
			},
			rowHandle: {
				//固定右侧
				fixed: 'right',

				dropdown: {
					more: {
						//更多按钮配置
						text: '更多',
						icon: '',
						iconRight: 'ArrowDown',
					},
				},
			},
			request: {
				//接口请求配置
				//你项目后台接口大概率与fast-crud所需要的返回结构不一致，所以需要配置此项
				//请参考文档http://fast-crud.docmirror.cn/api/crud-options/request.html
				transformQuery: ({ page, form, sort }: any) => {
					//转换为你pageRequest所需要的请求参数结构
					let currentPage = page.currentPage;
					let pageSize = page.pageSize;
					return { currentPage, pageSize, ...form };
					// return { page, form, sort };
				},
				transformRes: ({ res }: any) => {
					//将pageRequest的返回数据，转换为fast-crud所需要的格式
					let records = res.data;
					let currentPage = res.pageInfo.currentPage;
					let pageSize = res.pageInfo.pageSize;
					let total = res.pageInfo.total;
					return { records, currentPage, pageSize, total };
				},
			},
		};
	},
});

//配置uploader 公共参数
import { FsExtendsUploader } from '@fast-crud/fast-extends';
import '@fast-crud/fast-extends/dist/style.css';
app.use(FsExtendsUploader);

other.elSvg(app);

app.mount('#app');
