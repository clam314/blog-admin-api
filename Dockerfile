FROM node:15-alpine

LABEL maintainer=clam314@163.com

# 创建一个工作目录
WORKDIR /app

COPY . .

# 替换alpine的更新源为国内源（当前为清华源）以及更新时区
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories \
  && apk update \
  && apk add bash tzdata \
  && cp -r -f /usr/share/zoneinfo/Asia/Shanghai /etc/localtime


# 设置第三方依赖包sharp的镜像地址
RUN apk --no-cache add --virtual builds-deps build-base python alpine-sdk \
  && apk add --upgrade --no-cache vips-dev --repository https://alpine.global.ssl.fastly.net/alpine/v3.10/community/ \
  && npm config set sharp_binary_host "https://npm.taobao.org/mirrors/sharp" \
  && npm config set sharp_libvips_binary_host "https://npm.taobao.org/mirrors/sharp-libvips" \
  && yarn install --no-progress --registry=https://registry.npm.taobao.org \
  && npm run build:dev \
  && npm rebuild bcrypt --build-from-source \
  && apk del builds-deps

EXPOSE 3000 3001

VOLUME [ "/app/public" ]

CMD [ "node", "dist/server.bundle.js" ]
