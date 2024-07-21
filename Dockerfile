# step1
FROM node:20.15.1-slim as builds

# 设置工作目录
WORKDIR /app
COPY . /app/

# 编译
RUN npm i -g pnpm && pnpm i && pnpm run build

# step2
FROM nginx:1.18.0-alpine

# 作者
LABEL org.opencontainers.image.authors=kangert<kangert@qq.com>

# 添加时区环境变量，亚洲，上海
ENV TimeZone=Asia/Shanghai    

# 将前端dist文件中的内容复制到nginx目录
COPY --from=builds /app/dist/ /usr/share/nginx/html/

# nginx默认配置文件
COPY --from=builds /app/default.conf /etc/nginx/conf.d/

# 暴露端口
EXPOSE 80
