FROM node:14

RUN mkdir -p /usr/src/largeFileUpload

WORKDIR /usr/src/largeFileUpload

# add npm package
COPY package.json /usr/src/largeFileUpload/package.json

RUN npm i --registry=https://registry.npm.taobao.org

# copy code
COPY . /usr/src/largeFileUpload

EXPOSE 7003

CMD npx egg-scripts start --port=7003