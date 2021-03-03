<template>
  <div class="bigfile">
    <div>
      <el-upload
        class="upload-demo"
        drag
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
          <div>允许上传常见类型文件，因服务器配置，要求文件<span style="color: red">不大于5M</span> </div>
          <div style="font-weight: bold">但可设置文件分片上传的间隔时间，来体验大文件分片上传</div>
        </div>
      </el-upload>
      <h2>
        总分片上传<span style="color: #67C23A">成功</span>进度:
        <span style="color: #67C23A">{{sucessChip.success}}</span>
        /{{sucessChip.all}}
        <el-button
          style="margin-left: 32px; transform: translateY(-3px)"
          :type="pause? 'primary': 'danger'"
          size="small"
          @click="handlePause"
        ><span style="font-size: 14px">{{pause? '继续': '暂停'}} </span></el-button>
      </h2>
      <h3>
        总分片上传<span style="color: #F56C6C">失败</span>个数:
        <span style="color: #F56C6C">{{sucessChip.fail}}</span>
        /{{sucessChip.all}}
      </h3>
      <div>
        <h2>上传文件列表</h2>
        <el-table
          :data="fileTableData"
          style="width: 100%"
        >
          <el-table-column
            prop="filename"
            label="文件名称"
            width="180"
          >
          </el-table-column>
          <el-table-column
            prop="url"
            label="访问链接"
          >
            <template slot-scope="scope">
              <el-button type="link">{{scope.row.url}}</el-button>
            </template>
          </el-table-column>
          <el-table-column
            prop="failNum"
            label="分片上传失败次数"
            width="180"
          >
          </el-table-column>
        </el-table>
      </div>
    </div>

    <div class="bigfile-config">
      <h1>参数配置区</h1>
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
    fileTableData: [],
    chunkType: '1',
    chunkValue: 2,
    chunkInput: {
      min: 1,
      label: '请输入分片数量'
    },
    intervalTime: 300,
    pause: false,
    cancelUpload: null, // 取消上传文件网络请求
    cancelFiles: [],
    sucessChip: { // 切片总数与上传成功数量
      all: 0,
      fail: 0,
      success: 0
    }
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
        this.chunkValue = 100;
      }
    },

    handlePause() {
      this.pause = !this.pause;
      if (this.pause) {
        this.cancelUpload.cancel(); // 取消特定的http请求
      } else {
        this.cancelFiles.forEach((file) => {
          this.uploadFile({ file, uploadType: 'continue' });
        });
      }
    },

    // 设置总切片数数据
    setSucessChip() {
      const { fail, success, all } = this.sucessChip;
      if ((fail + success) === all || this.pause) {
        this.sucessChip = {
          all: 0,
          fail: 0,
          success: 0
        };
      }
    },


    uploadFile(param) {
      const { file, uploadType } = param;
      this.setSucessChip();
      if (this.pause) {
        this.cancelFiles = [];
        this.pause = false;
      }
      if (uploadType !== 'continue') {
        this.cancelFiles.push(file);
      }

      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file.slice());
      const spark = new SparkMD5.ArrayBuffer();

      fileReader.onload = async (e) => {
        spark.append(e.target.result);
        const md5FileHash = spark.end(); // 文件的唯一标识

        const { name: filename } = file;

        const { exist, url, chunks: successChunks } = await adapter.getFileChunk({ id: md5FileHash });
        if (exist) {
          this.fileTableData.push({
            filename,
            url
          });
          return;
        }
        let chunks = 3;
        let chunkSize = Math.ceil(file.size / chunks);
        if (this.chunkType === '1') {
          chunks = this.chunkValue;
          chunkSize = Math.ceil(file.size / chunks);
        }
        if (this.chunkType === '2') {
          chunkSize = this.chunkValue * 1024;
          chunks = Math.ceil(file.size / chunkSize);
        }

        this.sucessChip.all += chunks;
        // const chunkSize = 1000; // Read in chunks of 2MB


        let successFlag = 0;
        let failNum = 0;
        const { CancelToken } = axios;
        this.cancelUpload = CancelToken.source();
        for (let index = 0; index < chunks; index += 1) {
          if (!successChunks.includes(index)) {
            const end = (index + 1) * chunkSize >= file.size ? file.size : (index + 1) * chunkSize;
            const formData = new FormData();

            formData.set('index', index);
            formData.set('id', md5FileHash);
            formData.set('file', file.slice(index * chunkSize, end));

            let maxUploadNum = 3; // 最大尝试上传失败分片文件次数;

            // 上传文件流
            const uploadChunkFunc = () => {
              adapter.upload(formData, { cancelToken: this.cancelUpload.token }).then(() => {
                successFlag += 1;
                this.sucessChip.success += 1;

                if (successFlag === chunks) {
                  setTimeout(async () => {
                    // eslint-disable-next-line no-shadow
                    const { url } = await adapter.uploadSuccess({ filename, id: md5FileHash });
                    this.fileTableData.push({
                      filename,
                      url,
                      failNum
                    });
                  }, this.intervalTime);
                }
              }).catch(() => {
                if (this.pause) return;
                // 上传失败，继续进行请求
                maxUploadNum -= 1;

                failNum += 1;
                this.sucessChip.fail += 1;

                if (maxUploadNum > 0) {
                  uploadChunkFunc();
                } else {
                  this.fileTableData.push({
                    filename,
                    failNum
                  });
                }
              });
            };
            uploadChunkFunc();
          }
        }
      };
    },

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

.bigfile-config {
  margin-left: 100px;
}

h2 {
  margin: 24px 0 8px;
}


</style>
