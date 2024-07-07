# 基础镜像使用Nginx
FROM nginx:1.18.0-alpine

# 作者
LABEL org.opencontainers.image.authors=kangert<kangert@qq.com>

# 添加时区环境变量，亚洲，上海
ENV TimeZone=Asia/Shanghai    

# 将前端dist文件中的内容复制到nginx目录
COPY ./dist/  /usr/share/nginx/html/

# nginx默认配置文件
# COPY ./default.conf /etc/nginx/conf.d/

# 暴露端口
EXPOSE 80
