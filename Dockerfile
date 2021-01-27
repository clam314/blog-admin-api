FROM node:15-alpine

LABEL MAINTAINER="woods"

ENV GIT_BRANCH main
# 创建一个工作目录
WORKDIR /app

# 替换alpine的更新源为国内源（当前为清华源）以及更新时区
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories \
  && apk update \
  && apk add --no-cache bash tzdata \
  && cp -r -f /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
  && apk add --no-cache bash git \
  && git clone -b $GIT_BRANCH --depth=1 https://github.com/clam314/blog-admin-api.git /app \
  && cd /app \
  && rm -rf .git

COPY .env /app

RUN yarn install --no-progress --registry=https://registry.npm.taobao.org \
  && npm run build \
  && npm rebuild bcrypt --build-from-source \
  && rm -rf src \
  && rm .env

EXPOSE 4000

VOLUME [ "/app/public" ]

CMD [ "node", "dist/server.bundle.js" ]
