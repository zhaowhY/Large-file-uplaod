<template>
  <div class="bigfile">
    <div class="bigfile-uploading">
      <h1 class="bigfile-main-title">文件上传进度区
        <el-button
          v-show="Object.entries(uploadingFiles).length > 0"
          style="margin-left: 32px; transform: translateY(-5px)"
          :type="pause? 'primary': 'danger'"
          size="small"
          @click="handlePause"
        ><span style="font-size: 14px">{{pause? '继续': '暂停'}} </span></el-button>
      </h1>
      <div
        v-for="([name, value], index) of Object.entries(uploadingFiles)"
        :key="index"
      >
        <h2>{{name}}</h2>
        <el-table
          :data="value.chunks"
          style="width: 100%"
          size="mini"
        >
          <el-table-column
            prop="chipIndex"
            label="分片序号"
            align="center"
            width="80"
          >
          </el-table-column>
          <el-table-column
            prop="progress"
            label="上传进度"
          >
            <template slot-scope="scope">
              <el-progress :percentage="Number(scope.row.progress)"></el-progress>
            </template>
          </el-table-column>
        </el-table>
      </div>

    </div>

    <div class="bigfile-upload">
      <h1 class="bigfile-main-title">文件上传区</h1>
      <el-upload
        class="upload-demo"
        drag
        multiple
        action=""
        :show-file-list="false"
        :http-request="uploadFile"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.csv,.rar,.zip',.xlsx,.xls,.jpg,.zip,.xlsx,xls,.mp4,.png"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
          <p>支持多文件上传</p>
        </div>
        <div
          class="el-upload__tip"
          slot="tip"
          style="font-size: 15px"
        >
          <div>允许上传常见类型文件，因服务器配置，要求文件<span style="color: red">不大于20M</span> </div>
          <div style="font-weight: bold">但可设置文件分片上传的间隔时间，来体验大文件分片上传</div>
        </div>
      </el-upload>

      <div>
        <h2 style="color: #67C23A;">上传成功文件列表</h2>
        <el-table
          :data="fileTableData"
          style="width: 100%"
        >
          <el-table-column
            prop="filename"
            label="文件名称"
            width="140"
          >
          </el-table-column>

          <el-table-column
            prop="state"
            label="上传状态"
          >
            <template slot-scope="scope">
              <el-tag
                type="success"
                v-if="scope.row.url"
              >上传成功</el-tag>
              <el-tag
                type="danger"
                v-else
              >上传失败</el-tag>
            </template>
          </el-table-column>

          <el-table-column
            prop="action"
            label="操作"
          >
            <template slot-scope="scope">
              <el-link
                :href="scope.row.url"
                v-if="scope.row.url"
                type="primary"
                target="_blank"
              >点击下载</el-link>
              <span v-else> - </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <div class="bigfile-config">
      <h1 class="bigfile-main-title">参数配置区</h1>
      <div>
        <h2>分片规则</h2>
        <el-radio-group
          v-model="chunkType"
          @change="chunkTypeChange"
          size="medium"
        >
          <el-radio
            label="1"
            border
          >分片数量(个)</el-radio>
          <el-radio
            label="2"
            border
          >文件分片大小(KB)</el-radio>
        </el-radio-group>
        <div class="mt-line">
          <el-input-number
            v-model="chunkValue"
            :min="chunkInput.min"
            :label="chunkInput.label"
          ></el-input-number>
        </div>

      </div>
      <div>
        <h2>分片上传时间间隔(ms)</h2>

        <el-input-number
          v-model="intervalTime"
          :min="0"
          label="请输入分片上传间隔时间"
        ></el-input-number>
      </div>

    </div>
  </div>
</template>

<script>
/* eslint-disable no-loop-func */
import SparkMD5 from 'spark-md5';
import adapter from '@/api/demo';
import axios from 'axios';

export default {
  data: () => ({
    uploadingFiles: {},
    fileTableData: [],
    chunkType: '1',
    chunkValue: 3,
    chunkInput: {
      min: 1,
      label: '请输入分片数量'
    },
    intervalTime: 1000,
    pause: false,
    cancelUpload: null, // 取消上传文件网络请求
  }),
  methods: {
    chunkTypeChange(value) {
      if (value === '1') {
        this.chunkInput = {
          min: 1,
          label: '请输入分片数量'
        };
        this.chunkValue = 1;
      }
      if (value === '2') {
        this.chunkInput = {
          min: 1,
          label: '请输入分片大小'
        };
        this.chunkValue = 10;
      }
    },


    handlePause() {
      this.pause = !this.pause;
      if (this.pause) {
        this.cancelUpload.cancel(); // 取消特定的http请求
      } else {
        Object.entries(this.uploadingFiles).forEach(([, value]) => {
          this.uploadFile({ file: value.file });
        });
      }
    },


    uploadFile(param) {
      const { file } = param;
      const { name: filename, size } = file;
      if (size > 1024 * 1024 * 20) {
        this.$message.warning('文件不能超过20M');
        return;
      }

      // this.setSucessChip();
      if (this.pause) {
        this.pause = false;
      }

      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file.slice());
      const spark = new SparkMD5.ArrayBuffer();

      fileReader.onload = async (e) => {
        spark.append(e.target.result);
        const md5FileHash = spark.end(); // 文件的唯一标识

        const { exist, url, chunks: successChunks } = await adapter.getFileChunk({ id: md5FileHash });
        if (exist) {
          this.fileTableData.push({
            filename,
            url
          });
          return;
        }
        let successFlag = successChunks.length || 0;


        this.$set(this.uploadingFiles, filename, {
          file,
          chunks: []
        });


        let chunks = null;
        let chunkSize = null;
        if (this.chunkType === '1') {
          chunks = this.chunkValue;
          chunkSize = Math.ceil(file.size / chunks);
        } else if (this.chunkType === '2') {
          chunkSize = this.chunkValue * 1024;
          chunks = Math.ceil(file.size / chunkSize);
        } else {
          return;
        }
        if (successFlag >= chunks) {
          this.uploadSuccess({ filename, md5FileHash });
        }

        const { CancelToken } = axios;
        this.cancelUpload = CancelToken.source();
        const delay = time => new Promise(resolve => setTimeout(resolve, time));
        for (let index = 0; index < chunks; index += 1) {
          if (this.pause) return;

          this.uploadingFiles[filename].chunks.push({
            chipIndex: index,
            progress: 0
          });
          if (successChunks.includes(String(index))) {
            this.uploadingFiles[filename].chunks[index].progress = 100;
          }

          if (!successChunks.includes(String(index))) {
            const end = (index + 1) * chunkSize >= file.size ? file.size : (index + 1) * chunkSize;
            const formData = new FormData();

            formData.set('index', index);
            formData.set('id', md5FileHash);
            formData.set('file', file.slice(index * chunkSize, end));

            let maxUploadNum = 4; // 最大尝试上传失败分片文件次数;

            // 上传文件流
            const uploadChunkFunc = () => {
              adapter.upload(formData, {
                cancelToken: this.cancelUpload.token,

                // 对原生进度事件的处理
                onUploadProgress: (progressEvent) => {
                  const { loaded, total } = progressEvent;
                  const currentProgress = ((loaded / total) * 100).toFixed(0);
                  this.uploadingFiles[filename].chunks[index].progress = currentProgress;
                }
              }).then(() => {
                successFlag += 1;
                if (successFlag >= chunks) {
                  this.uploadSuccess({ filename, md5FileHash });
                }
              }).catch(() => {
                if (this.pause) return;
                // 上传失败，继续进行请求
                maxUploadNum -= 1;

                if (maxUploadNum > 0) {
                  uploadChunkFunc();
                } else {
                  this.fileTableData.push({
                    filename,
                  });
                }
              });
            };
            uploadChunkFunc();

            // 分片间隔时间
            // eslint-disable-next-line no-await-in-loop
            await delay(this.intervalTime);
          }
        }
      };
    },

    async uploadSuccess({ filename, md5FileHash }) {
      // eslint-disable-next-line no-shadow
      const { file: { url } } = await adapter.uploadSuccess({ filename, id: md5FileHash });
      this.fileTableData.push({
        filename,
        url,
      });
      this.$delete(this.uploadingFiles, filename);
    }

  }
};
</script>

<style lang="scss" scoped>
@import "variable";
.bigfile {
  display: flex;
  padding-top: 50px;
  justify-content: center;
  height: 100vh;
  background: #fafafa;
}

.bigfile-upload {
  margin: 0 100px;
}

.bigfile-uploading {
  width: 310px;
}

.bigfile-main-title {
  margin-bottom: 24px;
}

h2 {
  margin: 24px 0 8px;
}

</style>
