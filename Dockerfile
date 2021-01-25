FROM node:15-alpine

LABEL MAINTAINER="woods"

ENV GIT_BRANCH main
# 创建一个工作目录
WORKDIR /app

#COPY . .

# 替换alpine的更新源为国内源（当前为清华源）以及更新时区
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories \
  && apk update \
  && apk add bash tzdata \
  && cp -r -f /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

RUN apk add --no-cache bash git \
  && git clone -b $GIT_BRANCH --depth=1 https://github.com/clam314/blog-admin-api.git /app \
  && cd /app \
  && rm -rf .git

#COPY .env /app

# 设置第三方依赖包sharp的镜像地址
RUN apk --no-cache add --virtual builds-deps build-base python alpine-sdk \
  && apk add --upgrade --no-cache vips-dev --repository https://mirrors.tuna.tsinghua.edu.cn/alpine/v3.10/community/ \
  && npm config set sharp_binary_host "https://npm.taobao.org/mirrors/sharp" \
  && npm config set sharp_libvips_binary_host "https://npm.taobao.org/mirrors/sharp-libvips" \
  && yarn install --production --no-progress --registry=https://registry.npm.taobao.org \
  && npm run build \
  && npm rebuild bcrypt --build-from-source \
  && apk del builds-deps

EXPOSE 4000

VOLUME [ "/app/public", "/app/.env"]

CMD [ "node", "dist/server.bundle.js" ]
